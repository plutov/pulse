## @pulse/shared@0.0.0

This generator creates TypeScript/JavaScript client that utilizes [axios](https://github.com/axios/axios). The generated Node module can be used in the following environments:

Environment
* Node.js
* Webpack
* Browserify

Language level
* ES5 - you must have a Promises/A+ library installed
* ES6

Module system
* CommonJS
* ES6 module system

It can be used in both TypeScript and JavaScript. In TypeScript, the definition will be automatically resolved via `package.json`. ([Reference](https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html))

### Building

To build and compile the typescript sources to javascript use:
```
npm install
npm run build
```

### Publishing

First build the package then run `npm publish`

### Consuming

navigate to the folder of your consuming project and run one of the following commands.

_published:_

```
npm install @pulse/shared@0.0.0 --save
```

_unPublished (not recommended):_

```
npm install PATH_TO_GENERATED_PACKAGE --save
```

### Documentation for API Endpoints

All URIs are relative to *http://localhost*

Class | Method | HTTP request | Description
------------ | ------------- | ------------- | -------------
*AuthApi* | [**login**](docs/AuthApi.md#login) | **POST** /auth/login | User Login
*MonitorApi* | [**createMonitor**](docs/MonitorApi.md#createmonitor) | **POST** /monitors | Create Monitor
*MonitorApi* | [**deleteMonitor**](docs/MonitorApi.md#deletemonitor) | **DELETE** /monitors/{id} | Delete Monitor
*MonitorApi* | [**getMonitorById**](docs/MonitorApi.md#getmonitorbyid) | **GET** /monitors/{id} | Get Monitor by ID
*MonitorApi* | [**listMonitors**](docs/MonitorApi.md#listmonitors) | **GET** /monitors | List Monitors


### Documentation For Models

 - [CreateMonitorPayload](docs/CreateMonitorPayload.md)
 - [ErrorResponse](docs/ErrorResponse.md)
 - [HttpConfig](docs/HttpConfig.md)
 - [LoginPayload](docs/LoginPayload.md)
 - [LoginResponse](docs/LoginResponse.md)
 - [Monitor](docs/Monitor.md)
 - [MonitorType](docs/MonitorType.md)
 - [User](docs/User.md)
 - [ValidationMessage](docs/ValidationMessage.md)
 - [WithAuthor](docs/WithAuthor.md)
 - [WithCreatedAt](docs/WithCreatedAt.md)
 - [WithId](docs/WithId.md)
 - [WithMonitorType](docs/WithMonitorType.md)
 - [WithName](docs/WithName.md)
 - [WithOptionalHttpConfig](docs/WithOptionalHttpConfig.md)
 - [WithPassword](docs/WithPassword.md)
 - [WithSchedule](docs/WithSchedule.md)
 - [WithStatus](docs/WithStatus.md)
 - [WithToken](docs/WithToken.md)
 - [WithUpdatedAt](docs/WithUpdatedAt.md)
 - [WithUser](docs/WithUser.md)
 - [WithUsername](docs/WithUsername.md)


<a id="documentation-for-authorization"></a>
## Documentation For Authorization


Authentication schemes defined for the API:
<a id="BearerAuth"></a>
### BearerAuth

- **Type**: Bearer authentication (JWT)

