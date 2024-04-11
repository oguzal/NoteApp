export type Note = {
    id: string;
    note: string;
    createdAt: string;
    updatedAt: string;   
};

export type NoteDto = {
    id?: string;
    note: string; 
    createdAt?: Date
    updatedAt?: Date
}


export const fakeData: Note[] = [
    {
        id: '9s41rp',
        note: 'Kelvin',
        createdAt: '2024-02 -08T08: 18: 54.573Z',
        updatedAt: '2024-06 -08T09: 19: 56.573Z'
    },

    {
        id: '08m6rx',
        note: 'Molly',
        createdAt: '2024-03 -08T08: 28: 54.573Z',
        updatedAt: '2024-04 -08T09: 29: 56.573Z'
    }
];

