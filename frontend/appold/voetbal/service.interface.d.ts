/**
 * Created by cdunnink on 30-11-2016.
 */
import { Observable } from 'rxjs/Rx';
import { VoetbalInterface } from './interface';
export interface VoetbalServiceInterface {
    getObjects(): Observable<VoetbalInterface[]>;
    getObject(id: number): Observable<VoetbalInterface>;
    createObject(object: any): Observable<VoetbalInterface>;
    updateObject(object: VoetbalInterface): Observable<VoetbalInterface>;
    deleteObject(id: number): Observable<void>;
}
