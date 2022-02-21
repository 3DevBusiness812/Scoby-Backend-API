FROM node:14.7

WORKDIR /app
ADD . /app

EXPOSE 3000
CMD ["yarn", "start:prod"]
