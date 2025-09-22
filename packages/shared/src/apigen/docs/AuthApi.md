# AuthApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**login**](#login) | **POST** /auth/login | User Login|

# **login**
> LoginResponse login(loginPayload)


### Example

```typescript
import {
    AuthApi,
    Configuration,
    LoginPayload
} from '@pulse/apigen';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let loginPayload: LoginPayload; //

const { status, data } = await apiInstance.login(
    loginPayload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **loginPayload** | **LoginPayload**|  | |


### Return type

**LoginResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Login successful |  -  |
|**401** | 401 |  -  |
|**500** | 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

