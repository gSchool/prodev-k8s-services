FROM node:15.7.0-buster
RUN apt-get install gcc
RUN npm install -g node-gyp

WORKDIR /usr/src/app
COPY package*.json ./
RUN CXX=g++-6 npm install

EXPOSE 80
CMD [ "npm", "run", "dev" ]
