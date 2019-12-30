# Project Creator

This is a simple project generator for some of the most common experiments I work on from time to time. So far I only really have a few but it will grow overtime.

## Generators

- webpack: A simple project that uses webpack as a builder.
- webpack-mapbox-sample: A sample mapbox project for exploring mapbox related work.

## To install and run locally do the following steps:

- `git checkout {this repo}`
- `cd {this repo}`
- `yarn install` || `npm install`
- `npm install -g .`

After the last step you should restart the terminal before using the following command:

```
generate
```

This will start you with the following terminal question:

```
? What project template would you like to generate? 
❯ socket-io-chat-app 
  storybook.5.2.8 
  webpack 
  webpack-mapbox-sample
```

Select `webpack` or `webpack-mapbox-sample` and the next question will ask you to name the project (folder for now).