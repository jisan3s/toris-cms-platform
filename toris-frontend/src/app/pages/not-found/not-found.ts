import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from "../../layouts/header/header";
import { Footer } from "../../layouts/footer/footer";

@Component({
    selector: 'app-not-found',
    imports: [RouterLink, Header, Footer],
    templateUrl: './not-found.html',
    styleUrl: './not-found.scss',
})
export class NotFound {}