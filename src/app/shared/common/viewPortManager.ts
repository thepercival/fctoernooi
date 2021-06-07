import { VoetbalRange } from 'ngx-sport';

export class ViewPortManager {

    viewPortRangeMap: ViewPortRangeMap = new ViewPortRangeMap();

    constructor(
        public viewPortNrOfColumnsMap: ViewPortNrOfColumnsMap, protected maxNrOfColumns: number) {
        this.initViewPorts(1);
    }

    initViewPorts(currentEndColumn: number) {
        const viewPortRangeMap = new ViewPortRangeMap();
        this.viewPortNrOfColumnsMap.forEach((nrOfColumns: number, viewPort: ViewPort) => {
            let endColumnNr = currentEndColumn;
            if (endColumnNr < nrOfColumns) {
                endColumnNr = nrOfColumns;
            }
            if (endColumnNr > this.maxNrOfColumns) {
                endColumnNr = this.maxNrOfColumns;
            }
            let startColumnNr = endColumnNr - nrOfColumns;
            if (startColumnNr < 1) {
                startColumnNr = 1;
            }
            viewPortRangeMap.set(viewPort, { min: startColumnNr, max: endColumnNr });
        });
        this.viewPortRangeMap = viewPortRangeMap;
    }

    decrement() {
        this.viewPortRangeMap.forEach((range: VoetbalRange) => {
            if (range.min === 1) {
                return;
            }
            range.min--;
            range.max--;
        });
    }

    increment() {
        this.viewPortRangeMap.forEach((range: VoetbalRange) => {
            if (range.max === this.maxNrOfColumns) {
                return;
            }
            range.min++;
            range.max++;
        });
    }

    getClass(columnNr: number): string {
        for (const viewPort of this.getViewPorts()) {
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