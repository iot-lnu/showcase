#!/bin/bash

# Update package list
sudo apt-get update

# Install necessary dependencies
sudo apt-get install -y git nodejs npm

# Clone the showcase repository
# git clone https://github.com/your-username/showcase.git

# Install dependencies
cd showcase/app
npm install
