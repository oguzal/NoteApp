
import express = require('express');
import { GetNotes, AddNote, DeleteNote, UpdateNote } from '../dal/dal';
import { NoteDto } from '../dal/entity/Note';
const router = express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', async (req: express.Request, res: express.Response) => {
    const notes = await GetNotes();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(notes);
});


router.post('/', async (req: express.Request, res: express.Response) => {
    try {
        const note: NoteDto = {
            note: req.body.note
        };
        await AddNote(note);
        res.status(201).json(note);
    } catch (error) {
        console.error('Error parsing request body:', error);
        res.status(400).json({ error: 'Invalid JSON data' });
        return;
    }
});

router.put('/:id', async (req: express.Request, res: express.Response) => {
    try {
        const noteId = req.params.id;
        const updatedNote = await UpdateNote(Number(noteId), req.body.note);
        res.status(200).json(updatedNote);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:id', async (req: express.Request, res: express.Response) => {
    try {
        const noteId = req.params.id;
        await DeleteNote(Number(noteId));
        res.status(204).send(); // 204 No Content (successful deletion)
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;