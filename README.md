# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
## API Demand
Check the following link:

https://hackmd.io/@SIp_c8L4RaeEQ3coJyh0mg/SJMpJwXJll

## Run Dev Server

To start the development server, first make sure you have cloned the repository like this:

```bash
.
├── mini-lab-api
├── mini-lab-scheduler
└── mini-lab-web
```

Inside the `mini-lab-web` directory, run the following command:

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

It will start the following services, along with the cypress service for e2e testing:

| Service            | Local Port |
| ------------------ | ---------- |
| mini-lab-api       | 8000       |
| mini-lab-db        | 27017      |
| mini-lab-scheduler | 8888       |
| mini-lab-web       | 3000       |

After running the above command, you can access the web application at [http://localhost:3000](http://localhost:3000).

The local changes will automatically reload the `mini-lab-web`

To stop the server, run:

```bash
docker compose -f docker-compose.dev.yml down
```

## Run prod server

To start the production server, run the following command (remember to stop the dev server first):

```bash
docker compose -f docker-compose.prod.yml up -d
```

It will pull the latest image from Github package registry and start the following services:

| Service            | Local Port |
| ------------------ | ---------- |
| mini-lab-api       | -          |
| mini-lab-db        | -          |
| mini-lab-scheduler | -          |
| mini-lab-web       | 3000       |
| watchtower         | -          |

After running the above command, you can access the web application at [http://localhost:3000](http://localhost:3000).

`watchtower` will check for new images every 5 minutes and update the containers if a new image is found.

To stop the server, run:

```bash
docker compose -f docker-compose.prod.yml down
```

### E2E Tests

To run the e2e tests, you need to start the dev/prod server first. Then, you can run the following command to start the cypress service:

```bash
docker compose -f docker-compose.cypress.yml up -d --build
```

It will start the following services:

| Service                | Local Port |
| ---------------------- | ---------- |
| mini-lab-cypress       | -          |
| mini-lab-cypress-novnc | 8080       |

You can run all the tests in headless mode by running:

```bash
docker exec mini-lab-cypress cypress run
```

Or access [http://localhost:8080](http://localhost:8080) to run the tests in the browser.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
