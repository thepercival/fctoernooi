import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
import { Observable }        from 'rxjs/Observable';
import { Subject }           from 'rxjs/Subject';
import { CompetitionSeasonSearchService } from './competition-season-search.service';
import { CompetitionSeason } from '../competitionseason/competitionseason';

@Component({
    moduleId: module.id,
    selector: 'competition-season-search',
    templateUrl: 'competition-season-search.component.html',
    styleUrls: [ 'competition-season-search.component.css' ],
    providers: [CompetitionSeasonSearchService]
})

export class CompetitionSeasonSearchComponent implements OnInit {
    competitionseasons: Observable<CompetitionSeason[]>;
    private searchTerms = new Subject<string>();
    constructor(
        private competitionSeasonSearchService: CompetitionSeasonSearchService,
        private router: Router) {}
    // Push a search term into the observable stream.
    search(term: string): void {
        this.searchTerms.next(term);
    }

    ngOnInit(): void {
        this.competitionseasons = this.searchTerms
            .debounceTime(300)        // wait for 300ms pause in events
            .distinctUntilChanged()   // ignore if next search term is same as previous
            .switchMap(term => term   // switch to new observable each time
                // return the http search observable
                ? this.competitionSeasonSearchService.search(term)
                // or the observable of empty competitionseasons if no search term
                : Observable.of<CompetitionSeason[]>([]))
            .catch(error => {
                // TODO: real error handling
                console.log(error);
                return Observable.of<CompetitionSeason[]>([]);
            });
    }
    gotoMain(competitionseason: CompetitionSeason): void {
        let link = ['/main', competitionseason.id];
        this.router.navigate(link);
    }
}
