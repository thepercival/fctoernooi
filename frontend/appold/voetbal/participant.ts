/**
 * Created by cdunnink on 7-12-2016.
 */

import {VoetbalInterface} from './interface';

export class Participant implements VoetbalInterface{
    private name: string;

    constructor(
        name: string
    ) {
        this.name = name;
    }

    getName(): string {
        return this.name;
    }

    setName( name:string ): void {
        this.name = name;
    }
}