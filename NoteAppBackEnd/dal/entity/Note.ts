import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"
import { Length, ValidationTypes } from "class-validator"

@Entity()
export class Note {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: "varchar",
        length: 300        
    })
    @Index({ fulltext: true })
    @Length(20, 300)
    note: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}


export class NoteDto { 
    id?: number
    note: string
    createdAt?: Date
    updatedAt?: Date
}