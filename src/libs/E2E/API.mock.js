/* eslint-disable rulesdir/no-api-in-views */
import Onyx from 'react-native-onyx';
import _ from 'underscore';
import Log from '@libs/Log';
import mockAuthenticatePusher from './apiMocks/authenticatePusher';
// mock functions
import mockBeginSignin from './apiMocks/beginSignin';
import mockOpenApp from './apiMocks/openApp';
import mockOpenReport from './apiMocks/openReport';
import mockReadNewestAction from './apiMocks/readNewestAction';
import mockSigninUser from './apiMocks/signinUser';

/**
 * A dictionary which has the name of a API command as key, and a function which
 * receives the api command parameters as value and is expected to return a response
 * object.
 */
const mocks = {
    BeginSignIn: mockBeginSignin,
    SigninUser: mockSigninUser,
    OpenApp: mockOpenApp,
    ReconnectApp: mockOpenApp,
    OpenReport: mockOpenReport,
    ReconnectToReport: mockOpenReport,
    AuthenticatePusher: mockAuthenticatePusher,
    ReadNewestAction: mockReadNewestAction,
};

function mockCall(command, apiCommandParameters, tag) {
    const mockResponse = mocks[command] && mocks[command](apiCommandParameters);
    if (!mockResponse) {
        Log.warn(`[${tag}] for command ${command} is not mocked yet! ⚠️`);
        return;
    }

    if (_.isArray(mockResponse.onyxData)) {
        return Onyx.update(mockResponse.onyxData);
    }

    return Promise.resolve(mockResponse);
}

/**
 * All calls to API.write() will be persisted to disk as JSON with the params, successData, and failureData.
 * This is so that if the network is unavailable or the app is closed, we can send the WRITE request later.
 *
 * @param {String} command - Name of API command to call.
 * @param {Object} apiCommandParameters - Parameters to send to the API.
 *
 * @returns {Promise}
 */
function write(command, apiCommandParameters = {}) {
    return mockCall(command, apiCommandParameters, 'API.write');
}

/**
 * For commands where the network response must be accessed directly or when there is functionality that can only
 * happen once the request is finished (eg. calling third-party services like Onfido and Plaid, redirecting a user
 * depending on the response data, etc.).
 * It works just like API.read(), except that it will return a promise.
 * Using this method is discouraged and will throw an ESLint error. Use it sparingly and only when all other alternatives have been exhausted.
 * It is best to discuss it in Slack anytime you are tempted to use this method.
 *
 * @param {String} command - Name of API command to call.
 * @param {Object} apiCommandParameters - Parameters to send to the API.
 *
 * @returns {Promise}
 */
function makeRequestWithSideEffects(command, apiCommandParameters = {}) {
    return mockCall(command, apiCommandParameters, 'API.makeRequestWithSideEffects');
}

/**
 * Requests made with this method are not be persisted to disk. If there is no network connectivity, the request is ignored and discarded.
 *
 * @param {String} command - Name of API command to call.
 * @param {Object} apiCommandParameters - Parameters to send to the API.
 *
 * @returns {Promise}
 */
function read(command, apiCommandParameters) {
    return mockCall(command, apiCommandParameters, 'API.read');
}

export {write, makeRequestWithSideEffects, read};
