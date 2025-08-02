import { Component, Input, OnInit } from '@angular/core';
import { TileInfo } from '../../../model/tile-info.model';
import { AppRoute } from 'src/app/core/constant/app-routing.const';

@Component({
  selector: 'app-item-tile-list',
  templateUrl: './item-tile-list.component.html',
  styleUrls: ['./item-tile-list.component.scss']
})
export class ItemTileListComponent implements OnInit{

  @Input('tileList')
  tileList!:TileInfo[];

  ngOnInit(): void {
    
   
  }


}
