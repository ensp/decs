
if (Drupal.jsEnabled){
  
  jQuery(document).ready(function(){
    
    if(jQuery("input[id*='decs-module']").length == 1){ // inicializa apenas quando o campo do DeCS for carregado  
    
      var Decs = {}; // objeto Decs
      
      /*
       * Language
       * Get decs interface words from drupal settings
       * To change use drupal Translate interface
       */
      Decs.words = Drupal.settings.decs.language_words;

      /*
       * VARIÁVEIS 
       */
      
      Decs.label = jQuery("label[for*='decs-module']"); // label do campo DeCS    
      Decs.invisibleField = jQuery("input[id*='decs-module']"); // campo DeCS
      Decs.steps = new Array(); // sequência de passos para montar a migalha de pão                 
      Decs.html = '' + // HTML da interface do modulo DeCS
            '<div id="decs-module">' + // decs-module
            ' <div id="decs-module-panel-toggle" class="decs-module-panel-toggle-closed">'+Decs.words.select_descriptors+'</div>' + // decs-module-panel-toggle                                
            ' <div id="decs-module-panel">' + // decs-module-panel 
            '   <div id="decs-module-search">' + // decs-module-search 
            '     <input type="text" id="decs-module-search-field"/>' + // decs-module-search-field
            '     <input type="button" id="decs-module-search-button" value="'+Decs.words.search+'"/>' + // decs-module-search-button
            '   </div>' +
            '   <div id="decs-module-descriptors">' + // decs-module-descriptors
            '     <div id="decs-module-breadcrumb">' + // decs-module-breadcrumb
            '     </div>' +                   
            '     <div id="decs-module-descriptor-deail">' + // decs-module-descriptor-deail
            '     </div>' +         
            '     <ul id="decs-module-descriptors-list">' + // decs-module-descriptors decs-module-descriptor
            '     </ul>' +                  
            '   </div>' +
            ' </div>' +
            ' <div id="decs-module-selected-descriptors">' + // decs-module-selected-descriptors                
            '   <ul id="decs-module-selected-descriptors-list">' + // decs-module-selected-descriptors-list
            '     <li id="decs-module-selected-descriptors-list-title">'+Decs.words.no_descriptor_selected+'</li>' + // decs-module-selected-descriptors-list-title
            '   </ul>' +                  
            ' </div>' +                   
            ' <div id="decs-module-loading"></div>' + // decs-module-loading          
            '</div>';
      
      /*
       * COMPORTAMENTOS 
       */
      
      /*
       * inicializa comportamento do controle que mostra/esconde a interface do modulo
       */   
      Decs.toggleBehavior = function(){         
        
        var toggle = jQuery('#decs-module-panel-toggle'); // controle
        
        toggle.click(function(){        
          
          var button = jQuery('#decs-module-search-button'); // botão "procurar"
          var descriptorsList = jQuery('#decs-module-descriptors'); // lista de descritores 
          
          button.hide(); // esconde botão "procurar"          
          descriptorsList.css('visibility','hidden'); // esconde lista de descritores com propriedade visibility para preservar a altura do elemento
          
          if (toggle.className == 'decs-module-panel-toggle-closed') // troca classes que controlam a imagem da seta 
            toggle.toggleClass('decs-module-panel-toggle-closed', 'decs-module-panel-toggle-oppened');
          else  
            toggle.toggleClass('decs-module-panel-toggle-oppened', 'decs-module-panel-toggle-closed');        
          
          jQuery('#decs-module-panel').toggle('slow', function(){ // mostra ou esconde painel com lista de descritores            
            button.show(); // mostra botão "procurar"
            descriptorsList.css('visibility','visible'); // mostra lista de descritores
          });       
        });   
      };
      
      /*
       * remove comportamento do controle que mostra/esconde a interface do modulo
       */
      Decs.removeToggleBehavior = function(){ 
        jQuery('#decs-module-panel-toggle').unbind("click");
      };  
      
      /*
       * inicializa comportamento dos descritores 
       */
      Decs.descriptorBehavior = function(){         
        
        jQuery("#decs-module-descriptors-list .decs-module-descriptor").click(function(){ // obtem lista de descritores por termo                               
          Decs.getDescriptorsByTreeId(jQuery(this).attr("id").replace("decs-module-descriptor-", ""), jQuery(this).text());
        });     
              
        jQuery("#decs-module-descriptors-list .decs-module-descriptor").mouseover(function(){ // altera cor do texto
          jQuery(this).addClass('decs-module-descriptor-hover');
        });
            
        jQuery("#decs-module-descriptors-list .decs-module-descriptor").mouseout(function(){ // altera cor do texto
          jQuery(this).removeClass('decs-module-descriptor-hover');
        });
        
        jQuery(".decs-module-descriptor-add").click(function(){ // adiciona um descritor a lista de descritores selecionados
          Decs.updateInvisibleField(jQuery(this).next().html());
        });
      };
  
      /*
       * inicializa comportamento dos descritores selecionados
       * descriptor String
       */
      Decs.selectedDescriptorRemoveBehavior = function(descriptor){     
        
        jQuery(descriptor).click(function(){
                
          jQuery(this).parent().hide('slow', function(){ // esconde descritor selecionado           
            
            var descriptor_str = jQuery(descriptor).next().text(); // texto do descritor selecionado 
            var descriptors_str = Decs.invisibleField.val(); // descritores no campo DeCS
            
            // alert(Decs.invisibleField.val());
                      
            if (descriptors_str.indexOf(',') == -1){ // se o campo DeCS estiver preenchido com um único descritor
              
              if (descriptors_str == descriptor_str) // compara descritor na no campo DeCS com descritor selecionado
                Decs.invisibleField.val(''); // remove descritor do campo DeCS    
            
            } else { // se o campo DeCS estiver preenchido com dois ou mais descritores
              
              var descriptors_array = descriptors_str.split(' , '); // array com descritores no campo DeCS
              var purgedDescriptors_array = new Array(); // array para descritores filtrados
              
              for (var i=0, total=descriptors_array.length; i<total; i++) // procura lista de descritores no campo DeCS 
                if (descriptors_array[i] != descriptor_str) // compara descritor no campo DeCS com descritor selecionado 
                  purgedDescriptors_array.push(descriptors_array[i]); // adiciona descritor na lista de descritores filtrados
              
              Decs.invisibleField.val(purgedDescriptors_array.join(' , ')); // atualiza valor do campo DeCS
            } 
              
            // alert(Decs.invisibleField.val());            
            
            jQuery(this).remove(); // remove elemento <li> da lista de descritores selecionados   
            
            var total = jQuery('#decs-module-selected-descriptors-list li').length - 1; // conta total de descritores na lista de descritores selecionados
            var textValue = ''; // texto com quantidade de descritores na lista de descritores selecionados 
            
            if(total == 0) // se a lista de descritores estiver vazia
              textValue = Decs.words.no_descriptor_selected;
            else if (total == 1) // se tiver apenas 1 item na lista 
              textValue = Decs.words.one_descriptor_selected;
            else // se tiver mais de 1 item na lista
              textValue = total + Decs.words.descriptors_selected;
            
            jQuery('#decs-module-selected-descriptors-list-title').text(textValue); // atualiza texto com quantidade de descritores selecionados          
          });       
        });     
      };    
      
      /*
       * inicializa comportamento do campo de busca
       */
      Decs.searchFieldBehavior = function() {
        
        $('#decs-module-search-field').focus(function(){ // campo de busca
          
          jQuery(this).keydown(function(event) { // captura tecla precionada                            
            
            if (event.keyCode == '13') { // executa método "getDescriptorsByWords" se a tecla "enter" for precionada              
              jQuery("#decs-module-search-button").click();
              return false;
            }             
          });   
        }); 
      };
      
      /*
       * inicializa comportamento do botão
       * 
       * TODO: tratar jQuery("#decs-module-search-field").val(), remover acentos e passar caracteres para caixa baixa   
       */   
      Decs.searchButtonBehavior = function(){
        
        var button = jQuery("#decs-module-search-button");
        
        button.removeAttr('disabled');
        
        button.click(function(){
          
          var value = jQuery("#decs-module-search-field").val();
          
          if (value.split(' ').join('') != ''){
            Decs.getDescriptorsByWords(value);
          } else {
            alert( Decs.words.field_empty );
          }
        });
      };    
      
      /*
       * remove comportamento do botão
       */
      Decs.removeSearchButtonBehavior = function(){
        
        var button = jQuery("#decs-module-search-button");
        
        button.unbind("click");
        button.attr('disabled', 'disabled');
      };
      
      /*
       * MANIPULAÇÃO DO CONTEÚDO
       */
      
      /*
       * atualiza migalhas de pão
       */
      Decs.updateBreadcrumb = function() {
        
        var html  = '';           
        var total = this.steps.length;
        
        if (total > 1) {
          
          for (var i=0; i<total; i++) {
            
            if (i==0) // primeiro passo
              html += '<span class="decs-module-breadcrumb-fist-step">' + this.steps[i].text + '</span>';           
            else if (i+1 == total) // último passo
              html += ' / <span class="decs-module-breadcrumb-last-step">' + this.steps[i].text + '</span>';          
            else // passos intermediários
              html += ' / <span class="decs-module-breadcrumb-step" id="decs-module-breadcrumb-step-' + this.steps[i].treeId + '">' + this.steps[i].text + '</span>';
          }
        }     
  
        jQuery('#decs-module-breadcrumb').html('<p>' + html + '</p>');
      
        jQuery('.decs-module-breadcrumb-fist-step').click(function(){
          Decs.getDescriptorsByWords(Decs.steps[0].text);
        });
        
        jQuery(".decs-module-breadcrumb-step").each(function(){       
          jQuery(this).click(function(){  
            Decs.getDescriptorsByTreeId(jQuery(this).attr("id").replace("decs-module-breadcrumb-step-", ""), jQuery(this).text());
          });         
        });               
      };      
      
      /*
       * atualiza conteúdo do campo DeCS
       * descriptor String
       */
      Decs.updateInvisibleField = function(descriptor){     
        
        var descriptors = this.invisibleField.val(); // conteúdo do campo DeCS      
        var duplicated  = this.isSelectedDescriptor(descriptor); // flag que indica duplicidade do descritor
              
        if (descriptors.split(' ').join('') == ''){ // se o campo DeCS estiver vazio                
          this.invisibleField.val(descriptor); // adiciona descritor no campo DeCS
          this.updateSelectedDescriptors(descriptor); // atualiza lista de descritores selecionados             
        } else if (!duplicated){ // se o campo DeCS estiver preenchida e o descritor não for duplicado        
          this.invisibleField.val(descriptors + ' , ' + descriptor); // adiciona descritor no campo DeCS
          this.updateSelectedDescriptors(descriptor); // atualiza lista de descritores selecionados     
        } else {         
          alert("\"" + descriptor + "\" " + Decs.words.has_been_selected ); // alerta se houver duplicidade       
        } 
      };      
      
      /*
       * atualiza lista de descritores selecionados
       * descriptor String 
       */
      Decs.updateSelectedDescriptors = function(descriptor){        
        
        var html = ''; // HTML com seletores selecionados
        var total = 0; // total de seletores selecionados
        var duplicated = false; // flag que indica duplicidade de descritores
        
        jQuery.each(jQuery('#decs-module-selected-descriptors-list li'), function(){ // percorre lista de descritores selecionados
          
          total++; // incrementa total de descritores
          
          if(jQuery(this).text() == descriptor) // compara descritores
            duplicated = true; // configura para true flag que indica duplicidade de descritor
        });
              
        if(!duplicated) {
          
          html =  '<li style="display:none">' + 
              ' <span class="decs-module-descriptor-remove" title="remover">&nbsp;</span> ' + // decs-module-descriptor-remove 
              ' <span class="decs-module-selected-descriptor">' + descriptor + '</span>' + // decs-module-selected-descriptor 
              '</li>';
          
          jQuery('#decs-module-selected-descriptors-list li:last').after(html); // adiciona elemento <li> com novo descritor  
          
          jQuery('#decs-module-selected-descriptors-list li:last').show('slow', function(){ // mostra descritor         
            jQuery(this).addClass('decs-clearfix'); // adiciona regra de CSS clearfix           
            Decs.selectedDescriptorRemoveBehavior(jQuery(this).find('.decs-module-descriptor-remove').get(0)); // inicializa comportamento do novo descritor 
          });     
        }
        
        if(total == 1) // se tiver apenas 1 descritor selecionado
          jQuery('#decs-module-selected-descriptors-list-title').text( ' ' + Decs.words.one_descriptor_selected );
        else // se tiver mais de 1 descritor selecionado
          jQuery('#decs-module-selected-descriptors-list-title').text( total + ' ' + Decs.words.descriptors_selected );     
      };
      
      /*
       * atualiza lista de descritores
       * descriptors Array
       */
      Decs.updateDescriptors = function(descriptors){         
        
        var html   = ''; // HTML com lista de descritores
        var termo  = jQuery("#decs-module-search-field").val(); // texto no campo de busca
        var treeId = ''; // id da arvore do descritor
        var total  = 0; // total de descritores     
        
        this.breadcrumb = new Array(); // limpa array breadcrumb
        
        jQuery("#decs-module-breadcrumb p").remove(); // remove itens do breadcrumb     
        jQuery("#decs-module-descriptor-deail p").remove(); // remove conteúdo do detalhe do termo      
        jQuery("#decs-module-descriptors-list li").remove(); // remove todos os descritores da lista      
        
        for (descriptor in descriptors){ // cria nova lista de descritores
          
          treeId = descriptors[descriptor]['tree_id']; // id da arvore do descritor
          
          html += '<li>' +
              ' <span class="decs-module-descriptor-add" id="decs-module-treeid-' + treeId + '" title="selecionar">&nbsp;</span>&nbsp;' +
              ' <span class="decs-module-descriptor" id="decs-module-descriptor-' + treeId + '" title="detalhes">' + descriptor + '</span>' +           
              '</li>';
          total++; // incrementa total de descritores
        }
          
        if(html == ''){ // mostra total de descritores 
          html = '<li class="decs-module-alert-1">'+ Decs.words.search_term +': <em>' + termo + '</em> | '+ Decs.words.no_descriptors_found +'</li>' + html;
        }else{
          html = '<li class="decs-module-alert-2">'+ Decs.words.search_term +': <em>' + termo + '</em> | '+ Decs.words.descriptors_found + ' <em>' + total + '</em></li>' + html;
        }
        jQuery("#decs-module-descriptors-list").html(html); // carrega lista de descritores
              
        this.descriptorBehavior(); // inicializa comportamento dos descritores                        
        this.stopLoading(); // esconde loading      
      };
      
      /*
       * atualiza lista de descritores com definição e descritores descendentes
       * result Array
       */
      Decs.updateDescriptorsByTreeId = function(result){  
        
        var htmlDetail = ''; // HTML com detalhes do descritor
        var htmlDescriptors = ''; // HTML com lista de descritores 
        var total  = 0; // total de descritores     
        var treeId = ''; // id da arvore do descritor 
        
        // var term = result['term'];                 // termo
        var definition = result['definition']; // definição do termo  
        var descriptors = result['descriptors']; // array de descritores
        
        htmlDetail = '<p>' + // HTML com detalhes do descritor
        //       '  <strong>' + term + '</strong><br/>' +
               '  ' + definition + '' + 
               '</p>';
        
        for (descriptor in descriptors){ // HTML com lista de descritores
          
          treeId = descriptors[descriptor]['tree_id']; // id da arvore do descritor
          
          htmlDescriptors +=  '<li>' +
                    ' <span class="decs-module-descriptor-add" id="decs-module-treeid-' + treeId + '" title="selecionar">&nbsp;</span>&nbsp;' +
                    ' <span class="decs-module-descriptor" id="decs-module-descriptor-' + treeId + '" title="detalhes">' + descriptor + '</span>' +           
                    '</li>';
          total++; // incrementa total de descritores
        }   
  
        if (total == 1) // mostra total de descritores
          htmlDescriptors = '<li class="decs-module-alert-2">'+ Decs.words.descendent_descriptor +'</em>' + htmlDescriptors;                   
        else if (total > 1)
          htmlDescriptors = '<li class="decs-module-alert-2">'+ Decs.words.descendents_descriptors +'</em>' + htmlDescriptors;            
              
        jQuery("#decs-module-descriptors-list li").remove(); // remove todos os descritores da lista
        jQuery("#decs-module-descriptor-deail").html(htmlDetail); // carrega detalhes do descritor          
        jQuery("#decs-module-descriptors-list").html(htmlDescriptors); // carrega a lista de descritores  
        
        this.descriptorBehavior(); // inicializa comportamento dos descritores                    
        this.updateBreadcrumb();
        this.stopLoading(); // esconde loading        
      };
      
      /*
       * LOADING
       */
      
      Decs.startLoading = function() {
              
        this.removeToggleBehavior();      
        this.removeSearchButtonBehavior();
        
        jQuery('#decs-module-search-field').attr('disabled', 'disabled');
        
        var w = jQuery('#decs-module-descriptors').width();
        var h = jQuery('#decs-module-descriptors').height();
        var p = jQuery('#decs-module-descriptors').position();                  
        
        jQuery('#decs-module-loading').css({'width':w+'px','height':h+'px','top':p.top - 1,'left':p.left});
        jQuery('#decs-module-loading').fadeIn();
      };
      
      Decs.stopLoading = function() {
        
        jQuery("#decs-module-loading").fadeOut("slow", function(){
          Decs.toggleBehavior();
          Decs.searchButtonBehavior();
          jQuery('#decs-module-search-field').removeAttr('disabled');
        });
      };
          
      /*
       * AJAX
       */
      
      /*
       * retorna lista de descritores
       * words String
       */
      Decs.getDescriptorsByWords = function(words){       
              
        this.startLoading(); // mostra loading
                  
        var timeoutId = setTimeout(function(){ // espera 10 segundos e mostra mensagem se tentativa de conectar o DeCS falhar 
          alert( Decs.words.timeout );
          Decs.stopLoading();
        }, 10000, null);
        
        jQuery.getJSON(Drupal.settings.decs.words_uri + "/" + words, function(data){ // tenta conexão com DeCS para obter os descritores por termo        
          clearTimeout(timeoutId); // cancela execução do tratamento de erro        
          Decs.updateDescriptors(data.descriptors); // atualiza lista de descritores com resultado da busca                     
          Decs.steps = new Array();
          Decs.steps.push({'text':words});
        });
      };
      
      Decs.getDescriptorsByTreeId = function(treeId, text){
              
        this.startLoading(); // mostra loading
        
        var stepsTemp = new Array();
        
        for (var i=0; i<Decs.steps.length; i++)
          if(this.steps[i].text != text) {
            stepsTemp.push(this.steps[i]);      
          } else {
            if (i == 0)
              stepsTemp.push(this.steps[i]);
            break;
          } 
        
        this.steps = stepsTemp;
  
        var timeoutId = setTimeout(function(){ // espera 10 segundos e mostra mensagem se tentativa de conectar o DeCS falhar 
          alert( Decs.words.timeout );
          Decs.stopLoading();
        }, 10000, null);            
        
        jQuery.getJSON(Drupal.settings.decs.tree_uri + "/" + treeId, function(data){
          clearTimeout(timeoutId); // cancela execução do tratamento de erro        
          Decs.steps.push({'text':text,'treeId':treeId});
          Decs.updateDescriptorsByTreeId(data.result);                        
        });     
      };
      
      /*
       * MISCELANEA
       */
      
      Decs.loadDescriptors = function(){
        
        var descriptors_str = this.invisibleField.val();
        var descriptors_array = new Array();    
        var total = 0;
        
        if (descriptors_str.split(' ').join('') != ''){
          if (descriptors_str.indexOf(',') == -1){
            descriptors_array.push(descriptors_str); 
          } else {
            descriptors_array = descriptors_str.split(' , ');
          }
        }
        
        total = descriptors_array.length;
        
        for (var i=0; i<total; i++)       
          this.updateSelectedDescriptors(descriptors_array[i]);
      };    
      
      /*
       * verifica se um descritor já está na lista de descritores selecionados
       * descriptor String
       */
      Decs.isSelectedDescriptor = function(descriptor){
        
        var returnValue = false;            
        var descriptors = jQuery(this.invisibleField).val(); // conteúdo do campo DeCS        
          
        if (descriptors.indexOf(',') == -1){ // se o campo DeCS estiver preenchida com um único descritor               
          if (descriptors == descriptor) // se o descritor no campo DeCS for igual ao descritor selecionado...
            returnValue = true; // configura para verdadeiro o flag que indica a duplicidade do descritor             
        } else { // se o campo DeCS estiver preenchida com dois ou mais descritores
                  
          var array = descriptors.split(' , '); // array com descritores no campo DeCS
                  
          for (var i=0; i<array.length; i++) // percorre e compara cada descritor no campo DeCS com o descritor selecionado         
            if (array[i] == descriptor) // se o descritor no campo DeCS for igual ao descritor selecionado...           
              returnValue = true; // configura para verdadeiro o flag que indica a duplicidade do descritor
        }     
        
        return returnValue;
      };
      
      /*
       * INICIALIZADOR
       */
      Decs.init = function(){         
          
        this.invisibleField.css('display','none'); // esconde o campo DeCS
        this.label.after(this.html); // adiciona código HTML da interface da interface do modulo
        this.toggleBehavior(); // inicializa comportamento do controle para mostrar/esconder a interface do modulo
        this.searchButtonBehavior(); // inicializa comportamento do botão: procurar
        this.searchFieldBehavior(); // inicializa comportamento do campo de busca
        this.loadDescriptors(); // carrega descritores na inicialização do módulo
      };
      
      Decs.init();
    
    } // fim código Decs 
  });
} 
