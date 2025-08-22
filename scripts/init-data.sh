#!/bin/sh

# Initialize data directories and example files if they don't exist
# This script runs at container startup but preserves existing files

DATA_DIR="/app/data"
STARTUP_DIR="$DATA_DIR/startup"
CUSTOM_TEMPLATES_DIR="$DATA_DIR/custom-templates"

echo "Initializing ComposeToolbox data directories..."

# Create directories if they don't exist
mkdir -p "$STARTUP_DIR"
mkdir -p "$CUSTOM_TEMPLATES_DIR"

# Set proper permissions for the directories (world writable so host user can edit)
chmod 755 "$DATA_DIR" "$STARTUP_DIR" "$CUSTOM_TEMPLATES_DIR"

# Create startup template if it doesn't exist
STARTUP_TEMPLATE="$STARTUP_DIR/startup-template.yml"
if [ ! -f "$STARTUP_TEMPLATE" ]; then
    echo "Creating default startup template..."
    cat > "$STARTUP_TEMPLATE" << 'EOF'
services:
  composetoolbox:
    image: ghcr.io/bluegoosemedia/composetoolbox
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    volumes:
      - ./data:/app/data
EOF
    chmod 666 "$STARTUP_TEMPLATE"  # World writable so host user can edit
    echo "Created startup template at $STARTUP_TEMPLATE"
else
    echo "Startup template already exists, skipping..."
fi

# Create custom templates if it doesn't exist
CUSTOM_TEMPLATES_FILE="$CUSTOM_TEMPLATES_DIR/custom-templates.yml"
if [ ! -f "$CUSTOM_TEMPLATES_FILE" ]; then
    echo "Creating example custom templates..."
    cat > "$CUSTOM_TEMPLATES_FILE" << 'EOF'
# Custom Docker Compose Templates
# Add your own frequently used templates here
# 
# Structure:
# - name: Display name for the template
#   icon: Icon name 
#   code: The YAML code to insert 
#   description: Optional description

templates:
  - name: "Storage Pool Volume"
    icon: "HardDrive" 
    description: "Custom storage pool volume mapping"
    code: |
      volumes:
      - /mnt/Storage/composetoolbox/data:/data
  
  - name: "Dockernet"
    icon: "Network" 
    description: "Custom docker network"
    code: |
      networks:
        dockernet:
          external: true
EOF
    chmod 666 "$CUSTOM_TEMPLATES_FILE"  # World writable so host user can edit
    echo "Created custom templates at $CUSTOM_TEMPLATES_FILE"
else
    echo "Custom templates already exist, skipping..."
fi

echo "Data directories initialization complete!"
echo "Startup template: $STARTUP_TEMPLATE"
echo "Custom templates: $CUSTOM_TEMPLATES_FILE"
