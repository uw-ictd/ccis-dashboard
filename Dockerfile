FROM node:16
COPY . .
RUN npm install --production
RUN npm run build
RUN npm install -g forever
EXPOSE 8000
CMD forever -c "npm start" .
