FROM node:10-alpine

COPY package.json /app/package.json
WORKDIR /app
RUN npm install
COPY . ./

ADD https://raw.githubusercontent.com/eficode/wait-for/master/wait-for ./
RUN chmod +x wait-for

EXPOSE 8000
