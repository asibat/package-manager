# Package Manager

#### This project was developed with Node.js, Koa2, Redis using npmjs registry  api.

## Purpose and functionality
The Package Manager Service receives npm package name and returns a json of its full set of dependencies tree


# Payloads

## API

- **GET** */package/:packageName*
- **GET** */package/:packageName/version/packageVersion*

Response:

```
{
  "name": "accepts",
  "version": "100.100.100",
  "dependencies": [
    {
      "name": "mime-types",
      "version": "200.200.200",
      "dependencies": [
        {
          "name": "mime-db",
          "version": "400.400.400"
        }
      ]
    },
    {
      "name": "negotiator",
      "version": "300.300.300"
    }
  ]
}
```
