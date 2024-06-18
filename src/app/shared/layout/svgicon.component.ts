import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-svg-icon',
  templateUrl: 'svgicon.component.html',
  styleUrls: ['./svgicon.component.scss']
})
export class SvgIconComponent implements OnInit {
  @Input() icon!: string;
  @Input() width?: number = 40;
  @Input() height?: number = 40;
  @Input() size?: number = 24;
  @Input() fill?: string;
  @Input() class?: string;

  ngOnInit(): void {
    if (!this.width || !this.height) {
      this.width = this.size;
      this.height = this.size;
    }
  }
}