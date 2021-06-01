import { VoetbalRange } from 'ngx-sport';

export class ViewPortManager {

    viewPortRangeMap: ViewPortRangeMap = new ViewPortRangeMap();
    currentEndColumn: number = 1;

    constructor(
        public viewPortNrOfColumnsMap: ViewPortNrOfColumnsMap, protected maxNrOfColumns: number) {
    }

    update(currentEndColumn: number) {
        this.currentEndColumn = currentEndColumn;
        const viewPortRangeMap = new ViewPortRangeMap();
        console.log(this.maxNrOfColumns, this.viewPortNrOfColumnsMap);
        this.viewPortNrOfColumnsMap.forEach((nrOfColumns: number, viewPort: ViewPort) => {
            console.log(nrOfColumns, viewPort);
            let startColumnNr = currentEndColumn - nrOfColumns;
            let endColumnNr = currentEndColumn;
            const underMin = 1 - startColumnNr;
            if (underMin > 0) {
                startColumnNr = 1;
                endColumnNr += startColumnNr;
            }
            if (endColumnNr > this.maxNrOfColumns) {
                endColumnNr = this.maxNrOfColumns;
            }
            viewPortRangeMap.set(viewPort, { min: startColumnNr, max: endColumnNr });
        });
        console.log(viewPortRangeMap);
        this.viewPortRangeMap = viewPortRangeMap;
    }

    getClass(columnNr: number): string {
        // console.log('columnNr', columnNr);
        for (const viewPort of this.getViewPorts()) {

            // const nrOfColumns = this.viewPortNrOfColumnsMap.get(viewPort);
            // if (nrOfColumns === undefined) {
            //     continue;
            // }
            const viewPortRange = this.viewPortRangeMap.get(viewPort);
            if (!viewPortRange || columnNr < viewPortRange.min || columnNr > viewPortRange.max) {
                continue;
            }
            if (viewPort === ViewPort.xs) {
                return '';
            }
            return 'd-none d-' + viewPort + '-table-cell';
        }
        return 'd-none';
    }

    decrement(): void {
        this.update(this.currentEndColumn - 1);
    }

    increment(): void {
        this.update(this.currentEndColumn + 1);
    }

    showBackArrow(viewPort: ViewPort): boolean {
        const viewPortRange = this.viewPortRangeMap.get(viewPort);
        return viewPortRange !== undefined && viewPortRange.min > 1;
    }

    showForwardArrow(viewPort: ViewPort): boolean {
        const viewPortRange = this.viewPortRangeMap.get(viewPort);
        return viewPortRange !== undefined && viewPortRange.max < this.maxNrOfColumns;
    }

    getSingleVisibleClass(viewPort: ViewPort): string {
        switch (viewPort) {
            case ViewPort.xs:
                return 'd-table-cell d-sm-none';
            case ViewPort.sm:
                return 'd-none d-sm-table-cell d-md-none';
            case ViewPort.md:
                return 'd-none d-md-table-cell d-lg-none';
            case ViewPort.lg:
                return 'd-none d-lg-table-cell d-xl-none';
            case ViewPort.xl:
                return 'd-none d-xl-table-cell';
        }
        return '';
    }

    getViewPorts(): ViewPort[] {
        return [ViewPort.xs, ViewPort.sm, ViewPort.md, ViewPort.lg, ViewPort.xl];
    }
}

export class ViewPortNrOfColumnsMap extends Map<ViewPort, number> {

}
export class ViewPortRangeMap extends Map<ViewPort, VoetbalRange> {
}

export enum ViewPort { xs = 'xs', sm = 'sm', md = 'md', lg = 'lg', xl = 'xl' }