#!/bin/bash

# Update package list
sudo apt-get update

# Install necessary dependencies
sudo apt-get install -y git nodejs npm

# Clone the showcase repository
# git clone https://github.com/your-username/showcase.git

# Install dependencies
cd app/
npm install

# Setup auto-launch
mkdir -p $HOME/.config/autostart
cp integration/home-assistant-kiosk.desktop $HOME/.config/autostart/home-assistant-kiosk.desktop

echo "Setup complete, try rebooting the system"