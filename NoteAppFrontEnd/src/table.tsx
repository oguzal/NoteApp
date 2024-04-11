import { useMemo, useState } from 'react';
import {
    MRT_EditActionButtons,
    MaterialReactTable,
    // createRow,
    type MRT_ColumnDef,
    type MRT_Row,
    type MRT_TableOptions,
    useMaterialReactTable,
} from 'material-react-table';

import {
    Box,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip,
} from '@mui/material';

import {
    QueryClient,
    QueryClientProvider,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { Note, NoteDto } from './makeData';
const minNoteSize: number = 20;
const maxNoteSize: number = 300;
const backEndApiUrl = 'http://localhost:1337';

const Example = () => {
    const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

    const columns = useMemo<MRT_ColumnDef<Note>[]>(
        () => [
            {
                accessorKey: 'id',
                header: 'Id',
                enableEditing: false,
                size: 80,
            },
            {
                accessorKey: 'note',
                header: 'Note',
                maxSize: maxNoteSize,
                minSize: minNoteSize,
         
     
                muiEditTextFieldProps: {
                    required: true,
                    error: !!validationErrors?.note,
                    helperText: validationErrors?.note,
                    //remove any previous validation errors when user focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            note: undefined,
                        }),
                    //optionally add validation checking for onBlur or onChange
                },
            },


            {
                accessorKey: 'createdAt',
                header: 'CreatedAt',
                type: 'date',
                enableEditing: false,
                size: 80,
            },
            {
                accessorKey: 'updatedAt',
                header: 'UpdatedAt',
                type: 'date',
                enableEditing: false,
                size: 80,
            },


        ],
        [validationErrors],
    );

    //call CREATE hook
    const { mutateAsync: createNote, isPending: isCreatingNote } =
        useCreateNote();
    //call READ hook
    const {
        data: fetchedNotes = [],
        isError: isLoadingNotesError,
        isFetching: isFetchingNotes,
        isLoading: isLoadingNotes,
    } = useGetNotes();
    //call UPDATE hook
    const { mutateAsync: updateNotes, isPending: isUpdatingNote } =
        useUpdateNote();
    //call DELETE hook
    const { mutateAsync: deleteNote, isPending: isDeletingNote } =
        useDeleteNote();

    //CREATE action
    const handleCreateNote: MRT_TableOptions<Note>['onCreatingRowSave'] = async ({
        values,
        table,
    }) => {
        const newValidationErrors = validateNote(values);
        if (Object.values(newValidationErrors).some((error) => error)) {
            setValidationErrors(newValidationErrors);
            return;
        }
        setValidationErrors({});
        await createNote(values);
        table.setCreatingRow(null); //exit creating mode
    };

    //UPDATE action
    const handleSaveNote: MRT_TableOptions<Note>['onEditingRowSave'] = async ({
        values,
        table,
    }) => {
        const newValidationErrors = validateNote(values);
        if (Object.values(newValidationErrors).some((error) => error)) {
            setValidationErrors(newValidationErrors);
            return;
        }
        setValidationErrors({});
        await updateNotes(values);
        table.setEditingRow(null); //exit editing mode
    };

    //DELETE action
    const openDeleteConfirmModal = (row: MRT_Row<Note>) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            deleteNote(row.original.id);
        }
    };

    const table = useMaterialReactTable({
        columns,
        data: fetchedNotes,
        createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
        editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
        enableEditing: true,
        getRowId: (row) => row.id,
        muiToolbarAlertBannerProps: isLoadingNotesError
            ? {
                color: 'error',
                children: 'Error loading data',
            }
            : undefined,
        muiTableContainerProps: {
            sx: {
                minHeight: '700px'
               
            },
        },
        onCreatingRowCancel: () => setValidationErrors({}),
        onCreatingRowSave: handleCreateNote,
        onEditingRowCancel: () => setValidationErrors({}),
        onEditingRowSave: handleSaveNote,
        //optionally customize modal content
        renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
            <>
                <DialogTitle variant="h5">Create New Note</DialogTitle>
                <DialogContent 
                    sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >                
                    {internalEditComponents} {/* or render custom edit components here */}
                </DialogContent>
                <DialogActions>
                    <MRT_EditActionButtons variant="text" table={table} row={row} />
                </DialogActions>
            </>
        ),
        //optionally customize modal content
        renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
            <>
                <DialogTitle variant="h5">Edit Note</DialogTitle>
                <DialogContent
                    sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                >
                    {internalEditComponents} {/* or render custom edit components here */}
                </DialogContent>
                <DialogActions>
                    <MRT_EditActionButtons variant="text" table={table} row={row} />
                </DialogActions>
            </>
        ),
        renderRowActions: ({ row, table }) => (
            <Box sx={{ display: 'flex', gap: '1rem' }}>
                <Tooltip title="Edit">
                    <IconButton onClick={() => table.setEditingRow(row)}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        ),
        renderTopToolbarCustomActions: ({ table }) => (
            <Button
                variant="contained"
                onClick={() => {
                    table.setCreatingRow(true); //simplest way to open the create row modal with no default values
                    //or you can pass in a row object to set default values with the `createRow` helper function
                    // table.setCreatingRow(
                    //   createRow(table, {
                    //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
                    //   }),
                    // );
                }}
            >
                Create New Note
            </Button>
        ),
        state: {
            isLoading: isLoadingNotes,
            isSaving: isCreatingNote || isUpdatingNote || isDeletingNote,
            showAlertBanner: isLoadingNotesError,
            showProgressBars: isFetchingNotes,
        },
    });

    return <MaterialReactTable table={table} />;
};

//CREATE hook (post new note to api)
function useCreateNote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (note: NoteDto) => {
            const response = await axios.post(backEndApiUrl + '/notes', note);
            return response;
        },
        // client side optimistic update
        //onMutate: (newNoteInfo: NoteDto) => {
        //    queryClient.setQueryData(
        //        ['notes'],
        //        (prevNotes: any) =>
        //            [
        //                ...prevNotes,
        //                {
        //                    ...newNoteInfo
        //                },
        //            ] as NoteDto[],
        //    );
        //},
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['notes'] }), //refetch notes after mutation, disabled for demo
    });
}

//READ hook (get notes from api)
function useGetNotes() {
    return useQuery<Note[]>({
        queryKey: ['notes'],
        queryFn: async () => {
            const response = await axios.get(backEndApiUrl + '/notes');
            const notes: Note[] = response.data;
            return notes;
        },
        refetchOnWindowFocus: false,
    });
}


//UPDATE hook (put note in api)
function useUpdateNote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (note: Note) => {
            const noteId = note.id;
            const newNote = {
                'note': note.note
            };
            const response = await axios.put(`${backEndApiUrl}/notes/${noteId}`, newNote);
            return response;
        },
        //client side optimistic update
        onMutate: (newNoteInfo: Note) => {
            queryClient.setQueryData(['notes'], (prevNotes: Note[]) =>
                prevNotes?.map((prevNote: Note) =>
                    prevNote.id === newNoteInfo.id ? newNoteInfo : prevNote,
                ),
            );
        },
         onSettled: () => queryClient.invalidateQueries({ queryKey: ['notes'] }), //refetch notes after mutation, disabled for demo
    });
}

//DELETE hook (delete note in api)
function useDeleteNote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (noteId: string) => {         
            const response = await axios.delete(`${backEndApiUrl}/notes/${noteId}`);
            const result = response.data;
            return result;
        },
        //client side optimistic update
        onMutate: (noteId: string) => {
            queryClient.setQueryData(['notes'], (prevNotes: Note[]) =>
                prevNotes?.filter((note: Note) => note.id !== noteId),
            );
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['notes'] }), //refetch notes after mutation, disabled for demo
    });
}

const queryClient = new QueryClient();

const ExampleWithProviders = () => (
    //Put this with your other react-query providers near root of your app
    <QueryClientProvider client={queryClient}>
        <Example />
    </QueryClientProvider>
);

export default ExampleWithProviders;

const validateRequired = (value: string) => !!value.length && value.length >= minNoteSize && value.length <= maxNoteSize;

function validateNote(note: Note) {
    return {
        note: !validateRequired(note.note)
            ? 'Note is Required between 20-300 characters'
            : ''
    };
}
