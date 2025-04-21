import { configureStore } from '@reduxjs/toolkit';
import accountReducer from './slice/accountSlice';
import userReducer from './slice/userSlice';
import permissionReducer from './slice/permissionSlice';
import roleReducer from './slice/roleSlice';
import categoryReducer from './slice/categorySlice';
import bookReducer from './slice/bookSlice';

// Tạo store
export const store = configureStore({
    reducer: {
        account: accountReducer,
        user: userReducer,
        permission: permissionReducer,
        role: roleReducer,
        // Thêm các reducer khác vào đây khi cần
        // job: jobReducer,
        book: bookReducer,
        category: categoryReducer,
    },
});

// Export các tiện ích để sử dụng trong app
export const dispatch = store.dispatch;
export const getState = store.getState;

