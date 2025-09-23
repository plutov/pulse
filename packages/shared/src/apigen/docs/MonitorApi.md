# MonitorApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createMonitor**](#createmonitor) | **POST** /monitors | Create Monitor|
|[**deleteMonitor**](#deletemonitor) | **DELETE** /monitors/{id} | Delete Monitor|
|[**getMonitor**](#getmonitor) | **GET** /monitors/{id} | Get Monitor|
|[**listMonitorRuns**](#listmonitorruns) | **GET** /runs | Get Monitor Runs|
|[**listMonitors**](#listmonitors) | **GET** /monitors | List Monitors|

# **createMonitor**
> Monitor createMonitor(createMonitorPayload)


### Example

```typescript
import {
    MonitorApi,
    Configuration,
    CreateMonitorPayload
} from '@pulse/shared';

const configuration = new Configuration();
const apiInstance = new MonitorApi(configuration);

let createMonitorPayload: CreateMonitorPayload; //

const { status, data } = await apiInstance.createMonitor(
    createMonitorPayload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createMonitorPayload** | **CreateMonitorPayload**|  | |


### Return type

**Monitor**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | ok |  -  |
|**400** | 400 |  -  |
|**401** | 401 |  -  |
|**500** | 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteMonitor**
> deleteMonitor()


### Example

```typescript
import {
    MonitorApi,
    Configuration
} from '@pulse/shared';

const configuration = new Configuration();
const apiInstance = new MonitorApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deleteMonitor(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | Monitor deleted successfully |  -  |
|**400** | 400 |  -  |
|**401** | 401 |  -  |
|**404** | 404 |  -  |
|**500** | 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMonitor**
> Monitor getMonitor()


### Example

```typescript
import {
    MonitorApi,
    Configuration
} from '@pulse/shared';

const configuration = new Configuration();
const apiInstance = new MonitorApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.getMonitor(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**Monitor**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | ok |  -  |
|**400** | 400 |  -  |
|**401** | 401 |  -  |
|**404** | 404 |  -  |
|**500** | 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listMonitorRuns**
> MonitorRunsList listMonitorRuns()


### Example

```typescript
import {
    MonitorApi,
    Configuration
} from '@pulse/shared';

const configuration = new Configuration();
const apiInstance = new MonitorApi(configuration);

let id: string; // (optional) (default to undefined)
let size: number; // (optional) (default to 50)
let offset: number; // (optional) (default to 0)

const { status, data } = await apiInstance.listMonitorRuns(
    id,
    size,
    offset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | (optional) defaults to undefined|
| **size** | [**number**] |  | (optional) defaults to 50|
| **offset** | [**number**] |  | (optional) defaults to 0|


### Return type

**MonitorRunsList**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | ok |  -  |
|**400** | 400 |  -  |
|**401** | 401 |  -  |
|**404** | 404 |  -  |
|**500** | 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listMonitors**
> Array<Monitor> listMonitors()


### Example

```typescript
import {
    MonitorApi,
    Configuration
} from '@pulse/shared';

const configuration = new Configuration();
const apiInstance = new MonitorApi(configuration);

const { status, data } = await apiInstance.listMonitors();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<Monitor>**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | ok |  -  |
|**401** | 401 |  -  |
|**500** | 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

