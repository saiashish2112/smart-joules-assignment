FROM node:14
WORKDIR /app
COPY ["package.json", "./"]
RUN npm install
COPY . .
RUN npm install pm2 -g
CMD ["pm2-runtime", "./bin/client.js", "app.js"]
