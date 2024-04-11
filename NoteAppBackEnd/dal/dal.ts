import { Repository } from "typeorm";
import { AppDataSource } from "./data-source"
import { Note, NoteDto } from "./entity/Note"
import { validate } from "class-validator";

async function GetNoteRepo(): Promise<Repository<Note>> {
    if (!AppDataSource?.isInitialized)
        await AppDataSource.initialize();
    const noteRepo = AppDataSource.getRepository(Note)
    return noteRepo
}

async function GetNotes(): Promise<Note[]> {
    try {
        if (!AppDataSource?.isInitialized)
            await AppDataSource.initialize();
        const notes = await AppDataSource.manager.find(Note);
        console.log("Loaded notes: ", notes);
        return notes;
    } catch (error) {
        console.log(error);
    }
}

//todo 
//async function GetNotesBySearchPhrase(keyword: string): Promise<Note[]> {
//   
//}

async function AddNote(noteDto: NoteDto): Promise<Note> {
    try {
        const repo = await GetNoteRepo()
        const note = new Note()
        note.note = noteDto.note

        const errors = await validate(note);
        if (errors.length > 0) {
            throw new Error(`Validation failed!`)
        }
        else {
            await repo.insert(note)
            console.log("Saved a new note with id: " + note.id);
            return note;
        }
    } catch (error) {
        console.log(error);
    }
}

async function DeleteNote(noteId: number): Promise<boolean> {
    try {
        const repo = await GetNoteRepo();
        await repo.delete(noteId);
        console.log(`Note with ID ${noteId} deleted successfully.`);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function UpdateNote(noteId: number, newNote: string): Promise<Note> {
    try {
        const repo = await GetNoteRepo();
        const existingNote = await repo.findOneBy({ id: noteId });
        if (!existingNote) {
            throw new Error(`Note with ID ${noteId} not found.`);
        }
        existingNote.note = newNote;
        const errors = await validate(existingNote);
        if (errors.length > 0) {
            throw new Error(`Validation failed!`)
        } else {
            await repo.save(existingNote);
            console.log(`Note with ID ${noteId} updated successfully.`);
            return existingNote;
        }
    }
    catch (error) {
        console.log(error);
    }
}

export { GetNotes, AddNote, DeleteNote, UpdateNote };



