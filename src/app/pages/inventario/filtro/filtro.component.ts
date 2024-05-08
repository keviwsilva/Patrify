import { Component } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { BackendService } from 'src/app/service/backend.service';
import { catchError, tap, throwError } from 'rxjs';

@Component({
  selector: 'filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 })),
      ]),
    ])
  ]
})
export class FiltroComponent {
  mostrarAddPatrimonio: boolean = false;
  token: string | null = null;

  name: string = '';
  valor: number = 0;
  quantidade: number = 0;
  fornecedor: string = '';
  dt_compra: string = ''; // Assuming date format as string
  local: string = '';
  ativoInativo: string = '';
  descricao: string = '';
  depreciacao: number = 0;
  tipo: string = '';
  file!: File;
  id: number = 0;
  

  constructor(private backendService: BackendService) {}


  alternarAddPatrimonio() {
    this.mostrarAddPatrimonio = !this.mostrarAddPatrimonio;
  }

  onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
        this.file = inputElement.files[0];
    }
}



  registerPatr() {
    // Retrieve token from localStorage
    this.token = localStorage.getItem('token');
    console.log('Token recuperado do localStorage:', this.token);
  
    const requiresFile = true; // Flag indicating if file is mandatory
  
    // Validate token presence and file selection (if mandatory)
    if (this.token && (this.file || !requiresFile)) {
      const patrimonioData = this.preparePatrimonioData();
  
      console.log(patrimonioData);
  
      // Create a FormData object for file upload
      const formData = new FormData();
  
      // Append the file to FormData (replace 'file' with actual backend key)
      // if (this.file && requiresFile) {
      //   formData.append('file', this.file);
      //   console.log('Image appended to FormData:', this.file.name);
      // }
  
      // Send POST request using HttpClient with FormData
      this.backendService.cadastrarPatrimonio(patrimonioData, this.token)
        .pipe(
          tap((response) => {
            console.log('Patrimônio cadastrado com sucesso!');
            console.log(response);
            
            // Send image upload request only if successful
            if (response && response.newPatrimonyId) {
              console.log('oi')
              this.backendService.patrimage(this.file, response.newPatrimonyId).pipe(
                tap((response) => {
                  console.log('Imagem enviada com sucesso:', response);
                }),
                catchError(error => {
                  console.error('Erro ao enviar imagem:', error);
                  // Handle image upload errors (e.g., display error message)
                  return throwError(error);
                })
              )
              .subscribe();
            }
          }),
          catchError(error => {
            console.error('Erro ao cadastrar patrimônio:', error);
            // Handle general errors (e.g., display error message)
            return throwError(error);
          })
        )
        .subscribe();
    } else {
      if (!this.token) {
        console.error('Token não encontrado no localStorage.');
      } else if (requiresFile) {
        console.error('Selecione uma imagem para enviar.');
      }
    }
  }
  
  
  
  // Helper function to prepare patrimonioData (optional):
  preparePatrimonioData() {
    const data = {
      name: this.name,
      valor: this.valor,
      quantidade: this.quantidade,
      dt_compra: this.dt_compra,
      local: this.local,
      ativoinativo: this.ativoInativo,
      descricao: this.descricao,
      depreciacao: this.depreciacao,
      tipo: this.tipo,
      // file: this.file
    };
  
   
  
    return data;
  }
  
  // Error handling function (optional, customize based on your needs):
  handleError(error: any) {
    console.error('Erro ao cadastrar patrimônio:', error);
    // Handle specific errors (e.g., display user-friendly messages)
    // ...
  }
  
}
