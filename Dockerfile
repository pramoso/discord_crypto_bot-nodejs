# Docker Image which is used as foundation to create
# a custom Docker Image with this Dockerfile
FROM node:16.15.0

# Create app directory
WORKDIR /usr/src/app

# Copies package.json and package-lock.json to Docker environment.
# Note that, rather than copying the entire working directory, we are only copying the package.json file. 
# This allows us to take advantage of cached Docker layers.
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Installs all node packages
RUN npm install

# Copies everything over to Docker environment
COPY . .

# Finally runs the application
CMD ["npm", "start"]