import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { HelpRoutingModule } from './help-routing.module';
import { provideHelpDataSource } from './data/help.providers';
import { HelpHomeComponent } from './page/help-home/help-home.component';
import { HelpArticleComponent } from './page/help-article/help-article.component';
import { HelpArticleBlocksComponent } from './components/help-article-blocks/help-article-blocks.component';

@NgModule({
  declarations: [
    HelpHomeComponent,
    HelpArticleComponent,
    HelpArticleBlocksComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    HelpRoutingModule,
  ],
  providers: [...provideHelpDataSource()],
})
export class HelpModule {}
