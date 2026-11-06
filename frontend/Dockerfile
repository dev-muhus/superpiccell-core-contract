FROM node:22-bookworm

# Install dependencies
RUN apt-get update && apt-get install -y \
  openssl \
  xz-utils \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /frontend

# Copy package.json and package-lock.json  
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
