# HTML-to-png-api

API made with nodejs/express to convert an encoded html string to a png image. The image then gets stored into a MongoDB database.

## Installation

`npm install`

## Usage

- Add the following to [the server](server.js):
  - MongoDB database link
  - Your domain (if you have one) or localhost
  - An API key (Note: Not encrypted)
- Run the server: `node server.js`
- Do a `POST` request with your `api-key` and **encoded** `html-data`
