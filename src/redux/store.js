import {
    configureStore
} from '@reduxjs/toolkit';
import accountReducer from './slice/accountSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
    key: 'root',
    storage,
};

const persistedReducer = persistReducer(persistConfig, accountReducer);

export const store = configureStore({
    reducer: {
        account: persistedReducer,
    },
});


export const persistor = persistStore(store);