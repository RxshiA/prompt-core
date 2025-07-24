# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install Python and pip (needed for the Python script)
RUN apk add --no-cache python3 py3-pip

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Create Python virtual environment and install Python dependencies
COPY script/requirements.txt ./script/
RUN python3 -m venv /app/venv
RUN /app/venv/bin/pip install --no-cache-dir -r script/requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 5001

# Start the application
CMD ["npm", "start"]
