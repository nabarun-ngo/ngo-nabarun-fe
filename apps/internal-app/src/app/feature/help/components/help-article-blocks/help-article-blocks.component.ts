import { Component, Input } from '@angular/core';
import type { HelpArticleBlock } from '../../domain/help.model';

@Component({
  selector: 'app-help-article-blocks',
  templateUrl: './help-article-blocks.component.html',
  styleUrls: ['./help-article-blocks.component.scss'],
  standalone: false,
})
export class HelpArticleBlocksComponent {
  @Input() blocks: HelpArticleBlock[] = [];
}
