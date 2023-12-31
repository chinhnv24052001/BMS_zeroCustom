import {Component, Injector, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {AppComponentBase} from '@shared/common/app-component-base';
import { filter as _filter } from 'lodash-es';

@Component({
    selector: 'language-switch',
    templateUrl: './language-switch.component.html',
    styles: ['.language-switch-btn { width: auto; height: auto; }']
})
export class LanguageSwitchComponent extends AppComponentBase implements OnInit {

    currentLanguage: abp.localization.ILanguageInfo;
    languages: abp.localization.ILanguageInfo[] = [];

    constructor(injector: Injector,
        private router: Router
        ) {
        super(injector);
    }

    ngOnInit(): void {
        this.languages = _filter(abp.localization.languages, l => (<any>l).isDisabled === false);
        this.currentLanguage = abp.localization.currentLanguage;
    }

    changeLanguage(language: abp.localization.ILanguageInfo) {
        abp.utils.setCookieValue(
            'Abp.Localization.CultureName',
            language.name,
            new Date(new Date().getTime() + 5 * 365 * 86400000), // 5 year
            abp.appPath
        );

        location.reload();
        this.router.navigateByUrl('/app/main/home');
    }
}
