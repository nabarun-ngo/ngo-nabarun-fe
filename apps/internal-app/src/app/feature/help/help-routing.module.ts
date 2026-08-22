import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { helpArticleResolver, helpCatalogResolver } from './data/help.resolver';
import { HelpHomeComponent } from './page/help-home/help-home.component';
import { HelpArticleComponent } from './page/help-article/help-article.component';

const route_data = AppRoute;

const routes: Routes = [
  {
    path: route_data.secured_help_home_page.path,
    component: HelpHomeComponent,
    pathMatch: 'full',
    resolve: { data: helpCatalogResolver },
  },
  {
    path: route_data.secured_help_article_page.path,
    component: HelpArticleComponent,
    resolve: { data: helpArticleResolver },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HelpRoutingModule {}
