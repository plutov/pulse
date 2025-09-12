# RepoApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createRepo**](#createrepo) | **POST** /repos | Create Repo|
|[**listRepos**](#listrepos) | **GET** /repos | List Repos|

# **createRepo**
> Repo createRepo(createRepoRequest)


### Example

```typescript
import {
    RepoApi,
    Configuration,
    CreateRepoRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new RepoApi(configuration);

let createRepoRequest: CreateRepoRequest; //

const { status, data } = await apiInstance.createRepo(
    createRepoRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createRepoRequest** | **CreateRepoRequest**|  | |


### Return type

**Repo**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | ok |  -  |
|**500** | 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listRepos**
> Array<Repo> listRepos()


### Example

```typescript
import {
    RepoApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RepoApi(configuration);

const { status, data } = await apiInstance.listRepos();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<Repo>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | ok |  -  |
|**500** | 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

