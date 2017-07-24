/**
 * Created by cdunnink on 7-12-2016.
 */
import { VoetbalInterface } from './interface';
export declare class Participant implements VoetbalInterface {
    private name;
    constructor(name: string);
    getName(): string;
    setName(name: string): void;
}
