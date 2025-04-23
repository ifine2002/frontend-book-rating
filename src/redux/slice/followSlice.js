import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callFetchFollow } from './../../api/services';

// First, create the thunk
export const fetchFollow = createAsyncThunk(
    'follow/fetchFollow',
    async ({ query }) => {
        const response = await callFetchFollow(query);
        return response;
    }
)


const initialState = {
    isFetching: true,
    data: {
        page: 1,
        pageSize: 10,
        pages: 0,
        total: 0
    },
    result: []
};


export const followSlide = createSlice({
    name: 'follow',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        // Use the PayloadAction type to declare the contents of `action.payload`
        setActiveMenu: (state, action) => {
            // state.activeMenu = action.payload;
        },


    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(fetchFollow.pending, (state, action) => {
            state.isFetching = true;
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchFollow.rejected, (state, action) => {
            state.isFetching = false;
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchFollow.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.data = action.payload.data;
                state.result = action.payload.data.result;
            }
            // Add user to the state array

            // state.courseOrder = action.payload;
        })
    },

});

export const {
    setActiveMenu,
} = followSlide.actions;

export default followSlide.reducer;
