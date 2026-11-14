// Global rules shared by every signed-in screen.
export const GLOBAL_CSS = `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:0}
        textarea::placeholder{color:#A09080}
        input::placeholder{color:#A09080}
        input{font-size:16px !important;-webkit-user-select:text;user-select:text}
        input[type=number]{-moz-appearance:textfield;}
        input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
        button{font-family:'Lato',-apple-system,sans-serif}
        p{margin:0}
        select option{background:#FFFFFF;color:#3B1E08}
        html{touch-action:manipulation}
        button:focus-visible,a:focus-visible,input:focus-visible,[tabindex]:focus-visible{outline:2px solid #B8860B;outline-offset:2px}
        body{background:#F5F5F5}
      `;
