import { createAction } from '@reduxjs/toolkit'

export const updateAllPairs = createAction<{ allPairs: string[] }>('pairs/updateAllPairs')
