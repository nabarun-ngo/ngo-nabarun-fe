import { NgModule } from '@angular/core';
import { HtmlSanitizerPipe } from '../pipes/html-sanitizer.pipe';

@NgModule({
  declarations: [HtmlSanitizerPipe],
  exports: [HtmlSanitizerPipe],
})
export class SharedPipesModule {}
