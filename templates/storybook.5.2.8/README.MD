# A Storybook template (made with react)
A storybook template to get started building component libraries.

## Install steps:
First, create a `process.env` in the root of the project and add a single line `MAPBOX_TOKEN="mapbox-gl.token.goes.here"` to the file. This will be needed when you run the project using your own environment (protected) variable. Then follow the install and start process:

- `yarn`
- `yarn bootstrap`
- `yarn start`

Or all in one shot: `yarn && yarn bootstrap && yarn start`. After which the server will auto launch to `http://localhost:6006/`