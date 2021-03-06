import {
  HttpClient,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SessionService } from 'src/app/services/session.service';
import { Pokemon } from '../models/pokemon.model';

const API_URL = environment.baseURL;
const API_KEY = environment.API_KEY;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _user: User = {
    id: null,
    username: '',
    pokemon: [],
  };
  private _error: string = '';

  constructor(
    private readonly http: HttpClient,
    private readonly sessionService: SessionService
  ) {}

  public fetchByUsername(username: string): Observable<User[]> {
    return this.http.get<User[]>(API_URL + '/trainers/?username=' + username);
  }

  public fetchById(id: number): Observable<User> {
    return this.http.get<User>(API_URL + '/trainers/' + id);
  }

  public addUser(username: string): Observable<User> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      }),
    };

    const body = JSON.stringify({
      username: username,
      pokemon: [],
    });
    return this.http.post<User>(API_URL + '/trainers', body, httpOptions);
  }

  public patchUser(user: User): Observable<User> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      }),
    };

    const body = JSON.stringify({
      pokemon: user.pokemon,
    });
    return this.http.patch<User>(
      API_URL + '/trainers/' + user.id,
      body,
      httpOptions
    );
  }

  public getUser(): User {
    return this._user;
  }

  public getError(): string {
    return this._error;
  }

  // handling patchUser result
  public updateUser(updatedUser: User, onSuccess: () => void): void {
    this.patchUser(updatedUser).subscribe((returnedUser: User) => {
      // if current user's state differs from returned user, update user state
      if (this.sessionService.user !== returnedUser) {
        this.sessionService.setUser(returnedUser);
      }
      // execute callback function
      onSuccess();
    }),
      (error: HttpErrorResponse) => {
        this._error = error.message;
      };
  }

  // handling patchUser result
  public updateUsersPokemons(
    user: User,
    pokemon: Pokemon[],
    onSuccess: () => void
  ): void {
    // Set updated Pokemon array to users Pokemons
    user.pokemon = pokemon;
    this.patchUser(user).subscribe((user: User) => {
      // Update the value also to the session service
      this.sessionService.setUser(user);
      onSuccess();
    }),
      (error: HttpErrorResponse) => {
        this._error = error.message;
      };
  }

  // handling fetchByUserName result
  public authenticate(username: string, onSuccess: () => void): void {
    this.fetchByUsername(username)
      .pipe(
        // map result
        switchMap((users: User[]) => {
          // if users has data, return first user
          if (users.length) {      
            return of(users[0]);
          }
          // if users array is empty, add new user
          return this.addUser(username);
        })
      ) 
      .subscribe(
        // set user state
        (user: User) => {
          if (user.id) {
            this.sessionService.setUser(user);
            // execute callback function
            onSuccess();
          }
        },
        (error: HttpErrorResponse) => {
          this._error = error.message;
        }
      );
  }
}
