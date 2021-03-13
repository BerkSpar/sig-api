import puppeteer from 'puppeteer';

async function authentication(browser, user, password) {
  const page = await browser.newPage();

  await page.goto('https://suap.ifba.edu.br/accounts/login/');
  await page.waitForSelector('.login-form');

  await page.$eval('#id_username', (el, user) => (el.value = user), user);
  await page.$eval(
    '#id_password',
    (el, password) => (el.value = password),
    password
  );

  await page.click('.submit-row', { waitUntil: ['load', 'domcontentloaded'] });

  await page.close();
}

async function getDadosGerais(browser, matricula) {
  const page = await browser.newPage();

  await page.goto(`https://suap.ifba.edu.br/edu/aluno/${matricula}/`, {
    waitUntil: ['load', 'domcontentloaded'],
  });

  let dados_gerais = await page.evaluate(() => {
    let dadosEditar = document.querySelector(
      '#content > ul.action-bar > li:nth-child(1) > ul'
    ).children;
    let id_api = dadosEditar[0].children[0].getAttribute('href').split('/');
    let id_suap = dadosEditar[2].children[0].getAttribute('href').split('/');

    let dadosGerais = document.querySelector(
      '#content > div.box > div > div:nth-child(2) > table'
    ).children;
    dadosGerais = dadosGerais[0].children;

    let dadosCurso = document.querySelector(
      '#content > div:nth-child(6) > div:nth-child(3) > div > table'
    ).children;
    dadosCurso = dadosCurso[0].children;

    let aluno_especial =
      dadosCurso[4].children[1].innerText == 'Não' ? false : true;

    const result = {
      id_api: id_api[3],
      id_suap: id_suap[3],

      nome: dadosGerais[0].children[1].innerText,
      situacao: dadosGerais[0].children[3].innerText,

      cpf: dadosGerais[2].children[1].innerText,

      aluno_especial,
    };

    return result;
  });

  await page.close();

  return dados_gerais;
}

async function getDadosAcademicos(browser, matricula) {
  const page = await browser.newPage();

  await page.goto(
    `https://suap.ifba.edu.br/edu/aluno/${matricula}/?tab=dados_academicos`,
    { waitUntil: ['load', 'domcontentloaded'] }
  );

  let dados_academicos = await page.evaluate(() => {
    let dadosAcademicos = document.querySelector(
      '#content > div:nth-child(6) > div:nth-child(2) > div > table'
    ).children;
    dadosAcademicos = dadosAcademicos[0].children;

    let dadosCurso = document.querySelector(
      '#content > div:nth-child(6) > div:nth-child(3) > div > table'
    ).children;
    dadosCurso = dadosCurso[0].children;

    let dadosCota = document.querySelector(
      '#content > div:nth-child(6) > div:nth-child(4) > div > table'
    ).children;
    dadosCota = dadosCota[0].children;

    let CRE = dadosAcademicos[0].children[5].innerText.replace(',', '.');

    let cota_sistec =
      dadosCota[0].children[1].innerText == 'Não se aplica' ? false : true;

    let cota_mec =
      dadosCota[1].children[1].innerText == 'Não se aplica' ? false : true;

    let periodo_ingresso = dadosAcademicos[3].children[3].innerText.replace(
      'º',
      ''
    );

    let periodo_referencia = dadosAcademicos[3].children[5].innerText.replace(
      'º',
      ''
    );

    const result = {
      matricula: dadosAcademicos[0].children[1].innerText,
      data_matricula: dadosAcademicos[0].children[3].innerText,
      CRE,

      observacao_matricula: dadosAcademicos[1].children[1].innerText,

      ano_ingresso: dadosAcademicos[3].children[1].innerText,
      periodo_ingresso,
      periodo_referencia,

      previsao_conclusao: dadosAcademicos[4].children[1].innerText,

      data_conclusao: dadosAcademicos[4].children[3].innerText,

      data_colacao: dadosAcademicos[4].children[5].innerText,

      data_expedicao_diploma: dadosAcademicos[5].children[1].innerText,
      data_migracao: dadosAcademicos[5].children[3].innerText,

      creditos: dadosAcademicos[6].children[1].innerText,

      linha_pesquisa: dadosCurso[3].children[1].innerText,

      cota_sistec,
      cota_mec,
    };

    return result;
  });

  await page.close();

  return dados_academicos;
}

async function getDadosCurso(browser, matricula) {
  const page = await browser.newPage();
  await page.goto(
    `https://suap.ifba.edu.br/edu/aluno/${matricula}/?tab=dados_academicos`,
    { waitUntil: ['load', 'domcontentloaded'] }
  );

  let dados_curso = await page.evaluate(() => {
    let dadosCurso = document.querySelector(
      '#content > div:nth-child(6) > div:nth-child(3) > div > table'
    ).children;
    dadosCurso = dadosCurso[0].children;

    let curso_id = dadosCurso[2].children[1].innerText.split(' -');
    let curso_codigo = dadosCurso[0].children[1].innerText.split(' -');
    let curso_nome = dadosCurso[1].children[1].innerText.split(' (');

    const result = {
      id: curso_id[0],
      codigo: curso_codigo[0],
      nome: curso_nome[0],
    };

    return result;
  });

  await page.close();

  return dados_curso;
}

async function getDadosPessoais(browser, matricula) {
  const page = await browser.newPage();
  await page.goto(
    `https://suap.ifba.edu.br/edu/aluno/${matricula}/?tab=dados_pessoais`,
    { waitUntil: 'domcontentloaded' }
  );

  let dados_pessoais = await page.evaluate(() => {
    let doc_geral = document.querySelector(
      '#content > div:nth-child(7) > div:nth-child(1) > div > table'
    ).children[0];

    let doc_escolares = document.querySelector(
      '#content > div:nth-child(7) > div:nth-child(2) > div > table'
    ).children[0];

    let doc_documentos = document.querySelector(
      '#content > div:nth-child(7) > div:nth-child(3) > div > table'
    ).children[0];

    let doc_contato = document.querySelector(
      '#content > div:nth-child(7) > div:nth-child(4) > div > table'
    ).children[0];

    let deficiencia =
      doc_geral.children[2].children[1].innerText == 'Não' ? false : true;

    const result = {
      geral: {
        nascimento: doc_geral.children[0].children[1].innerText,
        naturalidade: doc_geral.children[1].children[1].innerText,
        deficiencia,
        tipo_deficiencia: doc_geral.children[2].children[3].innerText,
        outras_necessidades: doc_geral.children[2].children[5].innerText,
        estado_civil: doc_geral.children[0].children[3].innerText,
        nacionalidade: doc_geral.children[1].children[3].innerText,
        sexo: doc_geral.children[3].children[1].innerText,
        etnia: doc_geral.children[3].children[3].innerText,
        tipo_sanguineo: doc_geral.children[3].children[5].innerText,
        nome_pai: doc_geral.children[4].children[1].innerText,
        nome_mae: doc_geral.children[5].children[1].innerText,
        nome_responsavel: doc_geral.children[6].children[1].innerText,
        email_responsavel: doc_geral.children[6].children[3].innerText,
        chave_acesso: doc_geral.children[6].children[5].innerText,
      },
      escolares: {
        nivel_ensino_anterior: doc_escolares.children[0].children[1].innerText,
        tipo_instituicao: doc_escolares.children[0].children[3].innerText,
        ano_conclusao: doc_escolares.children[0].children[5].innerText,
      },
      documentos: {
        identidade: doc_documentos.children[0].children[1].innerText,
        orgao_expedidor: doc_documentos.children[0].children[3].innerText,
        uf_identidade: doc_documentos.children[0].children[5].innerText,
        data_expedicao: doc_documentos.children[0].children[7].innerText,
        titulo_eleitor: doc_documentos.children[1].children[1].innerText,
        zona: doc_documentos.children[1].children[3].innerText,
        secao: doc_documentos.children[1].children[5].innerText,
        uf_titulo_eleitor: doc_documentos.children[1].children[7].innerText,
        tipo_certidao: doc_documentos.children[2].children[1].innerText,
        cartorio: doc_documentos.children[2].children[3].innerText,
        numero_termo: doc_documentos.children[3].children[1].innerText,
        folha: doc_documentos.children[3].children[3].innerText,
        livro: doc_documentos.children[3].children[5].innerText,
        data_emissao: doc_documentos.children[3].children[7].innerText,
        matricula: doc_documentos.children[3].children[9].innerText,
      },
      contato: {
        endereco: doc_contato.children[0].children[1].innerText,
        email: {
          academico: doc_contato.children[1].children[1].innerText,
          google: doc_contato.children[1].children[3].innerText,
          pessoal: doc_contato.children[1].children[5].innerText,
        },
        telefone: {
          principal: doc_contato.children[2].children[1].innerText,
          secundario: doc_contato.children[2].children[3].innerText,
          adicional_1: doc_contato.children[2].children[5].innerText,
          adicional_2: doc_contato.children[2].children[7].innerText,
        },
      },
    };

    return result;
  });

  await page.close();

  return dados_pessoais;
}

class ScrapingController {
  async getDados(request, response) {
    const { user, password } = request.query;
    const browser = await puppeteer.launch({ headless: false });

    await authentication(browser, user, password);

    let aluno = await getDadosGerais(browser, user);
    aluno.dados_academicos = await getDadosAcademicos(browser, user);
    aluno.curso = await getDadosCurso(browser, user);
    aluno.dados_pessoais = await getDadosPessoais(browser, user);

    browser.close();

    response.json(aluno);
  }
}

export default new ScrapingController();
