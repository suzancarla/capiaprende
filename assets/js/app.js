
(function(){
  // navegação clicável entre as telas do protótipo (simula abrir uma tela de verdade)
  // mapa de tela -> arquivo real do site, pra navegação funcionar como um site publicado de verdade
  var FRAME_MAP = {
  "login": "app/login.html",
  "home": "app/home.html",
  "estudar": "app/estudar.html",
  "escolha": "app/escolha.html",
  "chat": "app/chat.html",
  "escolha-verbos": "app/escolha-verbos.html",
  "chat-verbos": "app/chat-verbos.html",
  "simulado-setup": "app/simulado-setup.html",
  "simulado-quiz": "app/simulado-quiz.html",
  "simulado-resultado": "app/simulado-resultado.html",
  "conversas": "app/conversas.html",
  "voce": "app/voce.html",
  "guia": "app/guia.html",
  "sobre": "app/sobre.html",
  "config": "app/config.html",
  "login-professor": "adm/login-professor.html",
  "home-professor": "adm/home-professor.html",
  "turma": "adm/turma.html",
  "turma-detalhe": "adm/turma-detalhe.html",
  "turma-detalhe-vazia": "adm/turma-detalhe-vazia.html",
  "aluno-historico": "adm/aluno-historico.html",
  "cadastrar-aluno": "adm/cadastrar-aluno.html",
  "cadastrar": "adm/cadastrar.html",
  "conteudos": "adm/conteudos.html",
  "playground": "adm/playground.html",
  "questoes": "adm/questoes.html",
  "simulados": "adm/simulados.html",
  "cadastrar-simulado": "adm/cadastrar-simulado.html"
};
  // Navegação sempre RELATIVA à página atual (nunca com "/" na frente), pra funcionar
  // tanto se o site estiver na raiz do domínio quanto numa subpasta da hospedagem.
  // Só existem dois níveis de profundidade no site: raiz (index.html) e app/ ou adm/ (1 nível).
  function sitePrefix(){
    return /\/(app|adm)\/[^\/]*$/.test(window.location.pathname) ? '../' : '';
  }
  function scrollToFrame(id){
    var url = FRAME_MAP[id];
    if(!url) return;
    window.location.href = sitePrefix() + url;
  }
  document.querySelectorAll('[data-goto]').forEach(function(elm){
    elm.addEventListener('click', function(){
      var id = elm.getAttribute('data-goto');
      var url = FRAME_MAP[id];
      if(!url) return;
      if(elm.classList.contains('trigger-diag-chat')){ url += '?diag=1'; }
      window.location.href = sitePrefix() + url;
    });
  });

  // guia interativo — carrossel de passos com avançar/voltar/pular,
  // acessível a qualquer momento pelo novo item "Guia" no menu inferior
  (function(){
    var guideSteps = Array.prototype.slice.call(document.querySelectorAll('#guideStage .guide-step'));
    var guideDots = Array.prototype.slice.call(document.querySelectorAll('#guideDots .gdot'));
    var guideBack = document.getElementById('guideBack');
    var guideNext = document.getElementById('guideNext');
    var guideSkip = document.getElementById('guideSkip');
    if(!guideSteps.length || !guideNext) return;
    var guideIdx = 0;

    function renderGuide(){
      guideSteps.forEach(function(s, i){ s.classList.toggle('current', i === guideIdx); });
      guideDots.forEach(function(d, i){ d.classList.toggle('current', i === guideIdx); });
      if(guideBack){ guideBack.style.visibility = guideIdx === 0 ? 'hidden' : 'visible'; }
      guideNext.textContent = guideIdx === guideSteps.length - 1 ? 'Concluir' : 'Avançar';
    }
    function resetGuide(){ guideIdx = 0; renderGuide(); }

    guideNext.addEventListener('click', function(){
      if(guideIdx === guideSteps.length - 1){ resetGuide(); scrollToFrame('home'); return; }
      guideIdx++;
      renderGuide();
    });
    if(guideBack){
      guideBack.addEventListener('click', function(){
        if(guideIdx === 0) return;
        guideIdx--;
        renderGuide();
      });
    }
    if(guideSkip){
      guideSkip.addEventListener('click', function(){ resetGuide(); scrollToFrame('home'); });
    }
    guideDots.forEach(function(d, i){
      d.addEventListener('click', function(){ guideIdx = i; renderGuide(); });
    });
  })();

  // admin: filtro por série na lista de Turmas — mostra/esconde os cartões
  // conforme a série escolhida, sem precisar sair da tela
  (function(){
    var filtroRow = document.getElementById('turmaFiltros');
    var lista = document.getElementById('turmaList');
    var emptyMsg = document.getElementById('turmaEmptyMsg');
    if(!filtroRow || !lista) return;
    var chips = Array.prototype.slice.call(filtroRow.querySelectorAll('.pick-chip'));
    var cards = Array.prototype.slice.call(lista.querySelectorAll('[data-serie]'));

    chips.forEach(function(chip){
      chip.addEventListener('click', function(){
        chips.forEach(function(c){ c.classList.remove('active'); });
        chip.classList.add('active');
        var serie = chip.getAttribute('data-serie');
        var visibleCount = 0;
        cards.forEach(function(card){
          var show = serie === 'all' || card.getAttribute('data-serie') === serie;
          card.style.display = show ? '' : 'none';
          if(show){ visibleCount++; }
        });
        if(emptyMsg){ emptyMsg.style.display = visibleCount === 0 ? 'block' : 'none'; }
      });
    });
  })();

  // admin: filtro por conteúdo na lista de Simulados — mesmo mecanismo do filtro de Turmas
  (function(){
    var filtroRow = document.getElementById('simFiltros');
    var lista = document.getElementById('simList');
    var emptyMsg = document.getElementById('simEmptyMsg');
    if(!filtroRow || !lista) return;
    var chips = Array.prototype.slice.call(filtroRow.querySelectorAll('.pick-chip'));
    var rows = Array.prototype.slice.call(lista.querySelectorAll('.roster-row:not(.head)'));

    chips.forEach(function(chip){
      chip.addEventListener('click', function(){
        chips.forEach(function(c){ c.classList.remove('active'); });
        chip.classList.add('active');
        var conteudo = chip.getAttribute('data-conteudo');
        var visibleCount = 0;
        rows.forEach(function(row){
          var show = conteudo === 'all' || row.getAttribute('data-conteudo') === conteudo;
          row.style.display = show ? '' : 'none';
          if(show){ visibleCount++; }
        });
        if(emptyMsg){ emptyMsg.style.display = visibleCount === 0 ? 'block' : 'none'; }
      });
    });
  })();

  // tema claro/escuro do app — controlado pela aluna em Configurações,
  // aplicado no <html> pra valer em todas as telas ao mesmo tempo
  var themeSwitch = document.getElementById('themeSwitch');
  function setAppTheme(light){
    document.documentElement.setAttribute('data-app-theme', light ? 'light' : 'dark');
    if(themeSwitch){ themeSwitch.classList.toggle('on', light); }
    try{ localStorage.setItem('capiaprende-app-theme', light ? 'light' : 'dark'); }catch(e){}
  }
  var savedTheme = null;
  try{ savedTheme = localStorage.getItem('capiaprende-app-theme'); }catch(e){}
  // padrão é o tema claro — só fica escuro se a aluna tiver escolhido isso antes
  setAppTheme(savedTheme !== 'dark');
  if(themeSwitch){
    themeSwitch.addEventListener('click', function(){
      setAppTheme(!themeSwitch.classList.contains('on'));
    });
  }

  // seleção única de chip dentro de cada grupo (turma, matéria, filtros do professor, quantidade do simulado)
  document.querySelectorAll('.pick-row').forEach(function(row){
    row.addEventListener('click', function(e){
      var chip = e.target.closest('.pick-chip');
      if(!chip) return;
      row.querySelectorAll('.pick-chip').forEach(function(c){ c.classList.remove('active'); });
      chip.classList.add('active');
    });
  });

  // banco de questões: marcar qual alternativa é a correta (A/B/C/D)
  document.querySelectorAll('.qform').forEach(function(form){
    form.addEventListener('click', function(e){
      var mark = e.target.closest('.alt-mark');
      if(!mark) return;
      form.querySelectorAll('.alt-mark').forEach(function(m){ m.classList.remove('correct'); });
      mark.classList.add('correct');
    });
  });

  // admin: gerar questões com IA — a professora escolhe a quantidade, revisa
  // cada sugestão (aprova/descarta) e só então salva as aprovadas no banco
  (function(){
    var genBtn = document.getElementById('genQuestionsBtn');
    var reviewWrap = document.getElementById('aiReviewWrap');
    var reviewList = document.getElementById('aiReviewList');
    var saveBtn = document.getElementById('aiSaveBtn');
    var approvedCountEl = document.getElementById('aiApprovedCount');
    var totalCountEl = document.getElementById('aiTotalCount');
    var qCountLabel = document.getElementById('qCountLabel');
    var qListExisting = document.getElementById('qListExisting');
    if(!genBtn || !reviewWrap || !reviewList) return;
    var pristineReviewHTML = reviewList.innerHTML;

    function recount(){
      var items = reviewList.querySelectorAll('.ai-q-item');
      var approved = reviewList.querySelectorAll('.ai-q-item[data-approved="true"]').length;
      if(totalCountEl){ totalCountEl.textContent = items.length; }
      if(approvedCountEl){ approvedCountEl.textContent = approved; }
    }

    genBtn.addEventListener('click', function(){
      reviewList.innerHTML = pristineReviewHTML;
      var originalLabel = genBtn.textContent;
      genBtn.textContent = 'Gerando com a IA…';
      genBtn.style.opacity = '.7';
      setTimeout(function(){
        genBtn.textContent = originalLabel;
        genBtn.style.opacity = '';
        reviewWrap.hidden = false;
        recount();
        reviewWrap.scrollIntoView({block:'nearest'});
      }, 700);
    });

    reviewList.addEventListener('click', function(e){
      var approveBtn = e.target.closest('.ai-approve');
      var discardBtn = e.target.closest('.ai-discard');
      if(!approveBtn && !discardBtn) return;
      var item = e.target.closest('.ai-q-item');
      if(!item) return;
      if(approveBtn){
        item.setAttribute('data-approved', 'true');
        item.querySelector('.ai-approve').classList.add('active');
        item.querySelector('.ai-discard').classList.remove('active');
      } else {
        item.setAttribute('data-approved', 'false');
        item.querySelector('.ai-discard').classList.add('active');
        item.querySelector('.ai-approve').classList.remove('active');
      }
      recount();
    });

    if(saveBtn){
      saveBtn.addEventListener('click', function(){
        var approvedItems = reviewList.querySelectorAll('.ai-q-item[data-approved="true"]');
        if(approvedItems.length === 0 || !qListExisting) return;
        approvedItems.forEach(function(item){
          var qtext = item.querySelector('.qtext').textContent;
          var qalts = item.querySelector('.qalts').innerHTML;
          var qItem = document.createElement('div');
          qItem.className = 'q-item';
          qItem.innerHTML = '<div class="qtext">' + qtext + '</div><div class="qalts">' + qalts + '</div>';
          qListExisting.appendChild(qItem);
        });
        if(qCountLabel){
          var match = qCountLabel.textContent.match(/(\d+)/);
          var current = match ? parseInt(match[1], 10) : 0;
          var novoTotal = current + approvedItems.length;
          qCountLabel.textContent = novoTotal + ' questões cadastradas · usadas nos simulados dos alunos';
        }
        var savedCount = approvedItems.length;
        var originalSaveLabel = saveBtn.textContent;
        saveBtn.textContent = '✓ ' + savedCount + ' salva' + (savedCount > 1 ? 's' : '') + ' no banco!';
        setTimeout(function(){
          reviewWrap.hidden = true;
          saveBtn.textContent = originalSaveLabel;
        }, 1400);
      });
    }
  })();

  // simulado: escolher uma alternativa por questão
  document.querySelectorAll('.quiz-options').forEach(function(group){
    group.addEventListener('click', function(e){
      var opt = e.target.closest('.option');
      if(!opt) return;
      group.querySelectorAll('.option').forEach(function(o){ o.classList.remove('selected'); });
      opt.classList.add('selected');
    });
  });

  // playground do professor: chat de teste independente do chat do aluno
  (function(){
    var pgThread = document.getElementById('pgThread');
    var pgInput = document.getElementById('pgInput');
    var pgSend = document.getElementById('pgSend');
    if(!pgThread || !pgInput || !pgSend) return;
    var pgReplies = [
      'Boa pergunta pra testar! Com o prompt configurado, a Capivarinha responderia assim: explica o conceito com um exemplo do dia a dia e evita termos técnicos, como pedido no prompt.',
      'Testando com esse prompt, a resposta viria com um exemplo prático (tipo pizza ou chocolate) antes da definição formal — parece que o prompt está funcionando bem.',
      'Resposta simulada: a IA local seguiria o tom simples pedido no prompt e ofereceria uma dica antes de dar a resposta certa, como configurado.'
    ];
    var pgIdx = 0;
    function pgAddMsg(text, who){
      var div = document.createElement('div');
      div.className = 'msg ' + who;
      div.textContent = text;
      pgThread.appendChild(div);
      pgThread.scrollTop = pgThread.scrollHeight;
    }
    function pgSendMsg(){
      var text = (pgInput.value || '').trim();
      if(!text) return;
      pgInput.value = '';
      pgAddMsg(text, 'user');
      setTimeout(function(){
        pgAddMsg(pgReplies[pgIdx % pgReplies.length], 'bot');
        pgIdx++;
      }, 550);
    }
    pgSend.addEventListener('click', pgSendMsg);
    pgInput.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ pgSendMsg(); } });
  })();

  var diagIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="10" cy="10" r="6"/><path d="M20 20l-5.5-5.5"/></svg>';

  // ---- desenhos usados nas respostas guiadas da sondagem (Frações) ----
  var fracaoImg = '<div class="chat-img"><svg width="90" height="90" viewBox="0 0 90 90"><circle cx="45" cy="45" r="38" fill="none" stroke="#232E1C" stroke-width="2"/><path d="M45 7a38 38 0 010 76z" fill="#57FF2E"/><circle cx="45" cy="45" r="38" fill="none" stroke="#141B10" stroke-width="2"/></svg><span class="cap">1/2 da pizza = uma fração</span></div>';
  var pizzaCompareImg = '<div class="chat-img"><div style="display:flex;gap:12px;align-items:center;justify-content:center">' +
    '<svg width="60" height="60" viewBox="0 0 90 90"><circle cx="45" cy="45" r="38" fill="none" stroke="#232E1C" stroke-width="2"/><path d="M45 7a38 38 0 010 76z" fill="#57FF2E"/><circle cx="45" cy="45" r="38" fill="none" stroke="#141B10" stroke-width="2"/></svg>' +
    '<span style="font-family:\'Sora\';font-weight:800;font-size:15px">=</span>' +
    '<svg width="60" height="60" viewBox="0 0 90 90"><circle cx="45" cy="45" r="38" fill="none" stroke="#232E1C" stroke-width="2"/><path d="M45 7a38 38 0 010 76z" fill="#57FF2E"/><line x1="45" y1="45" x2="83" y2="45" stroke="#141B10" stroke-width="1.5"/><circle cx="45" cy="45" r="38" fill="none" stroke="#141B10" stroke-width="2"/></svg>' +
    '</div><span class="cap">1/2 da pizza = 2/4 da mesma pizza cortada diferente</span></div>';
  var chocoBarImg = '<div class="chat-img"><svg width="150" height="46" viewBox="0 0 150 46">' +
    '<rect x="1" y="1" width="148" height="44" rx="6" fill="#141B10" stroke="none"/>' +
    '<rect x="4" y="4" width="34" height="38" fill="#57FF2E"/>' +
    '<rect x="40" y="4" width="34" height="38" fill="#57FF2E"/>' +
    '<rect x="76" y="4" width="34" height="38" fill="#57FF2E"/>' +
    '<rect x="112" y="4" width="34" height="38" fill="none" stroke="#57FF2E" stroke-width="1.5"/>' +
    '<line x1="40" y1="4" x2="40" y2="42" stroke="#0B0F09" stroke-width="1.5"/>' +
    '<line x1="76" y1="4" x2="76" y2="42" stroke="#0B0F09" stroke-width="1.5"/>' +
    '<line x1="112" y1="4" x2="112" y2="42" stroke="#0B0F09" stroke-width="1.5"/>' +
    '<rect x="1" y="1" width="148" height="44" rx="6" fill="none" stroke="#232E1C" stroke-width="2"/>' +
    '</svg><span class="cap">3/4 da barra de chocolate</span></div>';

  // ---- desenhos usados nas respostas guiadas da sondagem (Tempos Verbais) ----
  var tenseBarImg = '<div class="chat-img"><svg width="180" height="50" viewBox="0 0 180 50">' +
    '<rect x="1" y="1" width="178" height="48" rx="8" fill="#141B10" stroke="#232E1C" stroke-width="2"/>' +
    '<rect x="6" y="6" width="52" height="38" rx="5" fill="none" stroke="#57FF2E" stroke-width="1.5"/>' +
    '<rect x="64" y="6" width="52" height="38" rx="5" fill="#57FF2E"/>' +
    '<rect x="122" y="6" width="52" height="38" rx="5" fill="none" stroke="#57FF2E" stroke-width="1.5" stroke-dasharray="3 3"/>' +
    '<text x="32" y="29" text-anchor="middle" font-family="Space Mono" font-size="8" fill="#93A187">ONTEM</text>' +
    '<text x="90" y="29" text-anchor="middle" font-family="Space Mono" font-size="8" font-weight="700" fill="#06280A">HOJE</text>' +
    '<text x="148" y="29" text-anchor="middle" font-family="Space Mono" font-size="8" fill="#93A187">AMANHÃ</text>' +
    '</svg><span class="cap">presente: a ação acontece agora</span></div>';
  var verbFormsImg = '<div class="chat-img"><div style="display:flex;gap:10px;align-items:center;justify-content:center">' +
    '<div style="background:#1B2416;border:1.5px solid #232E1C;border-radius:10px;padding:8px 12px;font-family:\'Space Mono\';font-size:12px;color:#93A187">estud<span style="color:#57FF2E;font-weight:700">ei</span></div>' +
    '<span style="font-family:\'Sora\';font-weight:800;font-size:15px;color:#93A187">→</span>' +
    '<div style="background:#1B2416;border:1.5px solid #57FF2E;border-radius:10px;padding:8px 12px;font-family:\'Space Mono\';font-size:12px;color:#F4F7EE">estud<span style="color:#57FF2E;font-weight:700">arei</span></div>' +
    '</div><span class="cap">estudei (passado) → estudarei (futuro): repare o final da palavra</span></div>';

  // instancia um chat contextual completo (sondagem + mapa de descoberta + mini-quiz)
  // pra um conteúdo específico — chamada uma vez pra Frações e outra pra Tempos Verbais,
  // reaproveitando toda a mecânica (o que muda é só a config de cada conteúdo)
  function setupChatInstance(cfg){
    var thread = document.getElementById(cfg.threadId);
    if(!thread) return;
    var input = document.getElementById(cfg.inputId);
    var send = document.getElementById(cfg.sendId);
    var mic = document.getElementById(cfg.micId);
    var mapEl = thread.parentElement ? thread.parentElement.querySelector('.discovery-map') : null;
    // guarda o HTML original (boas-vindas + sondagem) pra poder voltar a ele
    // depois que o chat for trocado pro modo "revisão guiada" vindo do simulado
    var defaultThreadHTML = thread.innerHTML;
    var replyIndex = 0;

    function addMsg(html, who){
      var div = document.createElement('div');
      div.className = 'msg ' + who;
      div.innerHTML = html;
      thread.appendChild(div);
      thread.scrollTop = thread.scrollHeight;
      return div;
    }
    // respostas guiadas: a Capivarinha funciona como reforço — devolve com uma
    // pergunta ou pista pra estimular o raciocínio, em vez de entregar a resposta pronta
    function botReplyFor(kind){
      if(kind && cfg.kindReplies[kind]){ return cfg.kindReplies[kind]; }
      var r = cfg.genericReplies[replyIndex % cfg.genericReplies.length];
      replyIndex++;
      return r;
    }
    function hideSuggestions(){
      var row = thread.querySelector('.suggest-row');
      if(row && row.parentNode){ row.parentNode.removeChild(row); }
    }
    function askAndReply(text, kind){
      addMsg(text, 'user');
      hideSuggestions();
      setTimeout(function(){ addMsg(botReplyFor(kind), 'bot'); }, 550);
    }
    function sendMsg(){
      var text = (input.value || '').trim();
      if(!text) return;
      input.value = '';
      askAndReply(text, null);
    }
    if(send){ send.addEventListener('click', sendMsg); }
    if(input){ input.addEventListener('keydown', function(e){ if(e.key === 'Enter'){ sendMsg(); } }); }
    // delegação no container (não no chip direto), assim continua
    // funcionando mesmo depois que o thread.innerHTML é trocado pelo modo diagnóstico
    thread.addEventListener('click', function(e){
      var chip = e.target.closest('.suggest-chip');
      if(!chip) return;
      askAndReply(chip.textContent, chip.getAttribute('data-a'));
    });

    // mapa de descoberta: chip que muda de cor conforme a Capivarinha vai
    // "aprendendo" o que o aluno sabe (via sondagem ou mini-quiz) — escopado
    // ao mapa deste conteúdo, pra não misturar o progresso de outro chat
    function setDiscoveryStatus(topic, status){
      if(!mapEl) return;
      var chip = mapEl.querySelector('.dm-chip[data-topic="' + topic + '"]');
      if(!chip) return;
      chip.classList.remove('partial', 'mastered');
      if(status){ chip.classList.add(status); }
    }
    function resetDiscoveryMap(){
      if(!mapEl) return;
      mapEl.querySelectorAll('.dm-chip').forEach(function(chip){
        chip.classList.remove('partial', 'mastered');
      });
    }

    // mini-quiz embutido no chat: pergunta rápida com feedback visual na hora,
    // pra confirmar o que o aluno aprendeu sem precisar abrir um simulado formal
    function addMiniQuiz(quizCfg){
      var optsHtml = quizCfg.options.map(function(o){
        return '<div class="mq-opt" data-correct="' + (o.correct ? 'true' : 'false') + '">' + o.label + '</div>';
      }).join('');
      var html = '<div class="mq-label">Vamos confirmar?</div><div class="mq-q">' + quizCfg.question + '</div><div class="mq-opts">' + optsHtml + '</div>';
      var div = document.createElement('div');
      div.className = 'mini-quiz';
      div.setAttribute('data-topic', quizCfg.topic);
      div.innerHTML = html;
      thread.appendChild(div);
      thread.scrollTop = thread.scrollHeight;
    }

    // sondagem diagnóstica: em vez do aluno escolher perguntas prontas pra fazer
    // à IA, é a Capivarinha quem pergunta em 1ª pessoa — a resposta do aluno
    // decide o próximo passo (explicação + desenho + mini-quiz de confirmação)
    thread.addEventListener('click', function(e){
      var qr = e.target.closest('.qr-btn');
      if(qr){
        var card = qr.closest('.sondagem-card');
        var flowId = card && card.getAttribute('data-flow');
        var choice = qr.getAttribute('data-choice');
        var qcfg = flowId && cfg.diagFlows[flowId] && cfg.diagFlows[flowId][choice];
        if(!qcfg) return;
        addMsg(qr.textContent, 'user');
        card.remove();
        setDiscoveryStatus(qcfg.topic, 'partial');
        setTimeout(function(){
          addMsg(qcfg.botReply, 'bot');
          if(qcfg.quiz){ setTimeout(function(){ addMiniQuiz(qcfg.quiz); }, 500); }
        }, 550);
        return;
      }
      var mq = e.target.closest('.mq-opt');
      if(mq){
        var quizBox = mq.closest('.mini-quiz');
        if(!quizBox || quizBox.classList.contains('answered')) return;
        quizBox.classList.add('answered');
        var correct = mq.getAttribute('data-correct') === 'true';
        quizBox.querySelectorAll('.mq-opt').forEach(function(o){
          if(o.getAttribute('data-correct') === 'true'){ o.classList.add('right'); }
        });
        if(!correct){ mq.classList.add('wrong'); }
        var topic = quizBox.getAttribute('data-topic');
        var fb = document.createElement('div');
        fb.className = 'mq-fb ' + (correct ? 'ok' : 'no');
        fb.textContent = correct ? '✓ Isso aí! Você mandou bem.' : '✕ Quase — a certa tá destacada. Bora praticar mais um pouco.';
        quizBox.appendChild(fb);
        setDiscoveryStatus(topic, correct ? 'mastered' : 'partial');
        setTimeout(function(){
          addMsg(cfg.followUpIntro, 'bot');
          var row = document.createElement('div');
          row.className = 'suggest-row';
          row.innerHTML = cfg.followUpChipsHTML;
          thread.appendChild(row);
          thread.scrollTop = thread.scrollHeight;
        }, 700);
        return;
      }
    });

    // modo diagnóstico: quando o aluno entra no chat vindo do resultado do simulado
    // (ou do card "Pontos de atenção" em Você), a conversa já abre citando o erro
    // específico e sonda o que ele lembra — em vez do "oi, quer começar?" padrão
    // (só existe pra conteúdos que já têm simulado — hoje, só Frações)
    function openChatDefault(){ thread.innerHTML = defaultThreadHTML; resetDiscoveryMap(); }
    function openChatDiagnostico(){
      if(!cfg.diagThreadHTML){ openChatDefault(); return; }
      thread.innerHTML = cfg.diagThreadHTML;
      resetDiscoveryMap();
      if(cfg.diagPresetTopic){ setDiscoveryStatus(cfg.diagPresetTopic, 'partial'); }
    }
    // no site multi-página, o modo diagnóstico vem da própria URL (?diag=1),
    // setada pelo link de origem (ver FRAME_MAP acima) em vez de mutar o DOM antes de navegar
    try {
      var __params = new URLSearchParams(window.location.search);
      if(__params.get('diag') === '1'){ openChatDiagnostico(); }
    } catch(e){}

    if(mic){
      mic.addEventListener('click', function(){
        if(mic.classList.contains('recording')) return;
        mic.classList.add('recording');
        setTimeout(function(){
          mic.classList.remove('recording');
          hideSuggestions();
          addMsg('<span class="wave">' +
            [6,10,5,13,8,4,11].map(function(h){ return '<span style="height:'+h+'px"></span>'; }).join('') +
            '</span><span class="dur">0:04</span>', 'user audio');
          setTimeout(function(){ addMsg(botReplyFor(null), 'bot'); }, 600);
        }, 900);
      });
    }
  }

  // ---- Frações: mesma conversa/mecânica de antes, agora rodando via setupChatInstance ----
  setupChatInstance({
    threadId: 'chatThread', inputId: 'chatInput', sendId: 'chatSend', micId: 'micBtn',
    chatGotoId: 'chat',
    kindReplies: {
      frac: 'Boa pergunta! Antes de eu contar, pensa comigo: você já dividiu uma pizza ou um chocolate com alguém? O que rolou com os pedaços? Me conta o que você acha que é uma fração.',
      compare: 'Vamos investigar juntos: entre 1/2 de uma pizza e 1/4 da mesma pizza, qual pedaço você acha que fica maior — e por quê?',
      exemplo: 'Vamos montar um exemplo juntos: imagina uma barra de chocolate com 4 pedaços iguais. Se você comesse 3 pedaços, como você escreveria isso em forma de fração?'
    },
    genericReplies: [
      'Boa pergunta! Vamos por partes — me conta o que você já entende disso, mesmo que não tenha certeza.',
      'Isso mesmo, você tá no caminho certo! O que você acha que vem a seguir?',
      'Deixa eu te mostrar de outro jeito, às vezes ajuda ver desenhado.' + fracaoImg
    ],
    followUpIntro: 'Se quiser, também posso ajudar com outras dúvidas:',
    followUpChipsHTML: '<div class="suggest-chip" data-a="frac">O que é uma fração?</div><div class="suggest-chip" data-a="compare">Como comparar frações?</div><div class="suggest-chip" data-a="exemplo">Me dá um exemplo!</div>',
    diagFlows: {
      'welcome-frac': {
        nunca: {
          userLabel: 'Nunca ouvi',
          botReply: 'Sem problema, vamos começar do zero! Repara nessa barra de chocolate dividida em 4 pedaços iguais, com 3 pintados — isso é uma fração: 3 partes de um total de 4.' + chocoBarImg,
          topic: 'basico',
          quiz: { question: 'Quantas partes tem o total dessa barra?', topic: 'basico', options: [{label:'4', correct:true}, {label:'3', correct:false}] }
        },
        talvez: {
          userLabel: 'Já ouvi, mas não lembro',
          botReply: 'Show, vamos relembrar juntos! Essas duas pizzas foram cortadas diferente, mas a quantidade que sobrou pintada é a mesma nas duas.' + pizzaCompareImg,
          topic: 'equivalencia',
          quiz: { question: 'Baseado no desenho, qual fração é equivalente a 1/2?', topic: 'equivalencia', options: [{label:'2/4', correct:true}, {label:'3/4', correct:false}] }
        },
        sei: {
          userLabel: 'Sei bem o que é!',
          botReply: 'Boa, então bora confirmar rapidinho — sem cola! 😄',
          topic: 'equivalencia',
          quiz: { question: 'Qual dessas frações é equivalente a 2/3?', topic: 'equivalencia', options: [{label:'4/6', correct:true}, {label:'3/4', correct:false}] }
        }
      },
      'post-simulado': {
        lembro: {
          userLabel: 'Lembro sim!',
          botReply: 'Ótimo, então bora confirmar:',
          topic: 'equivalencia',
          quiz: { question: 'Por que 1/2 é igual a 2/4?', topic: 'equivalencia', options: [{label:'Multiplicamos os dois números pelo mesmo valor', correct:true}, {label:'É só coincidência', correct:false}] }
        },
        'nao-lembro': {
          userLabel: 'Não lembro bem',
          botReply: 'Sem problema! Repara: se eu corto os mesmos pedaços da pizza em partes menores, a quantidade que sobra pintada não muda — só o número de pedaços.' + pizzaCompareImg,
          topic: 'equivalencia',
          quiz: { question: 'Seguindo essa ideia, qual é equivalente a 1/3?', topic: 'equivalencia', options: [{label:'2/6', correct:true}, {label:'2/4', correct:false}] }
        }
      }
    },
    diagThreadHTML: '<div class="msg bot">Vi no seu último simulado que você errou 2 questões sobre <strong>frações equivalentes</strong>.</div>' +
      '<div class="sondagem-card" data-flow="post-simulado">' +
        '<div class="diag-eyebrow">' + diagIconSvg + 'A CAPIVARINHA QUER SABER</div>' +
        '<div class="diag-q">Antes de revisar, me conta: você lembra por que 1/2 é igual a 2/4?</div>' +
        '<div class="quick-replies">' +
          '<div class="qr-btn" data-choice="lembro">Lembro sim!</div>' +
          '<div class="qr-btn" data-choice="nao-lembro">Não lembro bem</div>' +
        '</div>' +
      '</div>',
    diagPresetTopic: 'equivalencia'
  });

  // ---- Tempos Verbais: mesmo mecanismo, conteúdo e sondagem próprios ----
  setupChatInstance({
    threadId: 'chatThreadVerbos', inputId: 'chatInputVerbos', sendId: 'chatSendVerbos', micId: 'micBtnVerbos',
    chatGotoId: 'chat-verbos',
    kindReplies: {
      conceito: 'Boa pergunta! Pensa comigo: quando você fala "eu comi", "eu como" ou "eu vou comer", o que muda na frase é justamente o tempo verbal — ele mostra QUANDO a ação acontece. Me conta: você consegue pensar numa frase sua no passado?',
      identificar: 'Vamos investigar juntos: repara no final do verbo e em palavras por perto, tipo "ontem", "hoje" ou "amanhã" — elas dão pistas de qual tempo é. Numa frase com "amanhã", o verbo tá em que tempo, você acha?',
      exemplo: 'Vamos montar um exemplo: pensa na frase "eu brinco". Como você diria isso se já tivesse acontecido ontem?'
    },
    genericReplies: [
      'Boa pergunta! Vamos por partes — me conta o que você já entende sobre isso, mesmo que não tenha certeza.',
      'Isso mesmo, você tá no caminho certo! O que você acha que vem a seguir?',
      'Deixa eu te mostrar de outro jeito, às vezes ajuda ver na linha do tempo.' + tenseBarImg
    ],
    followUpIntro: 'Se quiser, também posso ajudar com outras dúvidas:',
    followUpChipsHTML: '<div class="suggest-chip" data-a="conceito">O que é um tempo verbal?</div><div class="suggest-chip" data-a="identificar">Como eu descubro o tempo de um verbo?</div><div class="suggest-chip" data-a="exemplo">Me dá um exemplo!</div>',
    diagFlows: {
      'welcome-verbos': {
        nunca: {
          userLabel: 'Não sei bem',
          botReply: 'Sem problema! Repara nessa linha do tempo: o verbo muda de forma dependendo de quando a ação acontece — ontem (passado), agora (presente) ou depois (futuro).' + tenseBarImg,
          topic: 'presente',
          quiz: { question: 'Em "eu estudo todo dia", o verbo está em que tempo?', topic: 'presente', options: [{label:'Presente', correct:true}, {label:'Passado', correct:false}] }
        },
        talvez: {
          userLabel: 'Acho que sei',
          botReply: 'Boa, vamos confirmar! Repara como o final da palavra muda: "estudei" (já aconteceu) vira "estudarei" (ainda vai acontecer).' + verbFormsImg,
          topic: 'futuro',
          quiz: { question: 'Qual dessas formas indica o futuro?', topic: 'futuro', options: [{label:'Estudarei', correct:true}, {label:'Estudei', correct:false}] }
        },
        sei: {
          userLabel: 'Sei bem!',
          botReply: 'Ótimo, então bora confirmar rapidinho — sem cola! 😄',
          topic: 'passado',
          quiz: { question: 'Qual é a forma no passado do verbo "estudar" pra "eu"?', topic: 'passado', options: [{label:'Estudei', correct:true}, {label:'Estudo', correct:false}] }
        }
      }
    },
    diagThreadHTML: null,
    diagPresetTopic: null
  });
})();
