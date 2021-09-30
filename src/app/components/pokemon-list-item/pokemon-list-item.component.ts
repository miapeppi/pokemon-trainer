import { Component, Input } from "@angular/core";
import { Pokemon } from "src/app/models/pokemon.model";
import { UserService } from 'src/app/services/user.service';
import { User } from '../../models/user.model'
import { SessionService } from 'src/app/services/session.service';

@Component({
    selector: 'app-pokemon-list-item',
    templateUrl: './pokemon-list-item.component.html',
    styleUrls: ['./pokemon-list-item.component.css'],
})
export class PokemonListItemComponent {
    @Input() pokemon!: Pokemon;
    @Input() index!: number; 
    
    constructor(private readonly userService: UserService,
        private readonly sessionService: SessionService) { }

    get user(): User {
        return this.userService.getUser()
    }

    public onCatchClick(): void {
        this.sessionService.user?.pokemon.push(this.pokemon)

        if(this.sessionService.user !== undefined) {
            this.userService.updateUser(this.sessionService.user, async() => {
                await console.log(this.sessionService.user)
            })
        }

    }
}
