import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // --- 1. Permitir rating e content nullable (o service já insere null) ---
  await knex.schema.alterTable("reviews", (table) => {
    table.decimal("rating", 2, 1).nullable().alter();
    table.text("content").nullable().alter();
  });

  // --- 2. Limpar dados de teste ---
  await knex("reading_update_likes").del();
  await knex("review_reactions").del();
  await knex("reading_updates").del();
  await knex("reviews").del();

  // --- 3. Buscar usuários existentes ---
  const users = await knex("users").select("id").where("deleted", false).orderBy("id");
  if (users.length === 0) return;

  const u1 = users[0]!.id;
  const u2 = users.length > 1 ? users[1]!.id : u1;
  const u3 = users.length > 2 ? users[2]!.id : u1;

  // --- 4. Inserir livros reais (ignorar se já existem) ---
  const booksData = [
    {
      google_books_id: "YHgwDwAAQBAJ",
      title: "O Pequeno Príncipe",
      authors: JSON.stringify(["Antoine de Saint-Exupéry"]),
      synopsis: "Um piloto perdido no deserto do Saara encontra um menino que veio de um pequeno asteroide. Juntos, exploram o significado da vida, do amor e da amizade.",
      cover_url: "https://books.google.com/books/content?id=YHgwDwAAQBAJ&printsec=frontcover&img=1&zoom=1",
      publisher: "HarperCollins Brasil",
      published_date: "2015-09-15",
      page_count: 96,
      isbn_13: "9788595081512",
      categories: JSON.stringify(["Ficção"]),
      language: "pt",
    },
    {
      google_books_id: "wrOQLV6xB-wC",
      title: "Harry Potter e a Pedra Filosofal",
      authors: JSON.stringify(["J.K. Rowling"]),
      synopsis: "Harry Potter descobre no dia de seu aniversário de onze anos que é filho de dois bruxos e que ele mesmo é um bruxo.",
      cover_url: "https://books.google.com/books/content?id=wrOQLV6xB-wC&printsec=frontcover&img=1&zoom=1",
      publisher: "Rocco",
      published_date: "2000-08-21",
      page_count: 264,
      isbn_13: "9788532511010",
      categories: JSON.stringify(["Ficção Fantástica", "Juvenil"]),
      language: "pt",
    },
    {
      google_books_id: "k6DwCwAAQBAJ",
      title: "1984",
      authors: JSON.stringify(["George Orwell"]),
      synopsis: "Winston Smith trabalha no Ministério da Verdade reescrevendo a história. Mas sua rebelião secreta contra o Partido o leva a uma jornada perigosa.",
      cover_url: "https://books.google.com/books/content?id=k6DwCwAAQBAJ&printsec=frontcover&img=1&zoom=1",
      publisher: "Companhia das Letras",
      published_date: "2009-07-21",
      page_count: 416,
      isbn_13: "9788535914849",
      categories: JSON.stringify(["Ficção Distópica"]),
      language: "pt",
    },
    {
      google_books_id: "FKziDwAAQBAJ",
      title: "Dom Casmurro",
      authors: JSON.stringify(["Machado de Assis"]),
      synopsis: "Bentinho narra a história de seu casamento com Capitu e a dúvida que o consome sobre a fidelidade da esposa.",
      cover_url: "https://books.google.com/books/content?id=FKziDwAAQBAJ&printsec=frontcover&img=1&zoom=1",
      publisher: "Penguin-Companhia",
      published_date: "2016-11-01",
      page_count: 256,
      isbn_13: "9788582850602",
      categories: JSON.stringify(["Literatura Brasileira"]),
      language: "pt",
    },
    {
      google_books_id: "NXQIEAAAQBAJ",
      title: "A Revolução dos Bichos",
      authors: JSON.stringify(["George Orwell"]),
      synopsis: "Os animais da Granja do Solar se rebelam contra o fazendeiro e tentam criar uma sociedade igualitária, mas gradualmente os porcos assumem o controle.",
      cover_url: "https://books.google.com/books/content?id=NXQIEAAAQBAJ&printsec=frontcover&img=1&zoom=1",
      publisher: "Companhia das Letras",
      published_date: "2007-07-12",
      page_count: 152,
      isbn_13: "9788535909555",
      categories: JSON.stringify(["Ficção", "Sátira Política"]),
      language: "pt",
    },
    {
      google_books_id: "Pe4jEAAAQBAJ",
      title: "Orgulho e Preconceito",
      authors: JSON.stringify(["Jane Austen"]),
      synopsis: "Elizabeth Bennet e o orgulhoso Sr. Darcy superam mal-entendidos e preconceitos para descobrir o amor verdadeiro na Inglaterra do século XIX.",
      cover_url: "https://books.google.com/books/content?id=Pe4jEAAAQBAJ&printsec=frontcover&img=1&zoom=1",
      publisher: "Penguin-Companhia",
      published_date: "2011-07-01",
      page_count: 424,
      isbn_13: "9788563560278",
      categories: JSON.stringify(["Romance", "Clássico"]),
      language: "pt",
    },
    {
      google_books_id: "xUaHDwAAQBAJ",
      title: "O Hobbit",
      authors: JSON.stringify(["J.R.R. Tolkien"]),
      synopsis: "Bilbo Bolseiro, um hobbit pacato, é convencido pelo mago Gandalf a embarcar numa aventura épica com treze anões para recuperar um tesouro guardado por um dragão.",
      cover_url: "https://books.google.com/books/content?id=xUaHDwAAQBAJ&printsec=frontcover&img=1&zoom=1",
      publisher: "HarperCollins Brasil",
      published_date: "2019-07-15",
      page_count: 336,
      isbn_13: "9788595084742",
      categories: JSON.stringify(["Ficção Fantástica"]),
      language: "pt",
    },
    {
      google_books_id: "Vn5xDwAAQBAJ",
      title: "Memórias Póstumas de Brás Cubas",
      authors: JSON.stringify(["Machado de Assis"]),
      synopsis: "Um defunto-autor narra suas memórias com ironia e humor negro, refletindo sobre a vaidade humana e a sociedade brasileira do século XIX.",
      cover_url: "https://books.google.com/books/content?id=Vn5xDwAAQBAJ&printsec=frontcover&img=1&zoom=1",
      publisher: "Penguin-Companhia",
      published_date: "2014-06-01",
      page_count: 208,
      isbn_13: "9788582850343",
      categories: JSON.stringify(["Literatura Brasileira"]),
      language: "pt",
    },
  ];

  for (const book of booksData) {
    const exists = await knex("books").where("google_books_id", book.google_books_id).first();
    if (!exists) {
      await knex("books").insert(book);
    }
  }

  const bookRows = await knex("books")
    .whereIn("google_books_id", booksData.map((b) => b.google_books_id))
    .select("id", "google_books_id", "page_count");

  const bookMap = new Map(bookRows.map((b: any) => [b.google_books_id, { id: b.id, pages: b.page_count }]));

  const b = (gid: string) => bookMap.get(gid)!;

  // --- 5. Garantir user_books para os cenários (sem remover existentes) ---
  const userBooksData = [
    // Usuário 1: variedade de status
    { user_id: u1, book_id: b("YHgwDwAAQBAJ").id, status: "lido", is_favorite: true, rating: 5.0, current_page: 96, started_at: "2026-01-10", finished_at: "2026-01-15" },
    { user_id: u1, book_id: b("wrOQLV6xB-wC").id, status: "lido", is_favorite: false, rating: 4.5, current_page: 264, started_at: "2026-02-01", finished_at: "2026-02-20" },
    { user_id: u1, book_id: b("k6DwCwAAQBAJ").id, status: "lendo", is_favorite: false, rating: null, current_page: 180, started_at: "2026-04-01", finished_at: null },
    { user_id: u1, book_id: b("FKziDwAAQBAJ").id, status: "quero_ler", is_favorite: false, rating: null, current_page: null, started_at: null, finished_at: null },
    { user_id: u1, book_id: b("NXQIEAAAQBAJ").id, status: "abandonado", is_favorite: false, rating: 2.0, current_page: 50, started_at: "2026-03-01", finished_at: null },
    { user_id: u1, book_id: b("Pe4jEAAAQBAJ").id, status: "relendo", is_favorite: true, rating: 4.0, current_page: 120, started_at: "2026-04-20", finished_at: null },

    // Usuário 2
    { user_id: u2, book_id: b("YHgwDwAAQBAJ").id, status: "lido", is_favorite: true, rating: 5.0, current_page: 96, started_at: "2026-03-05", finished_at: "2026-03-06" },
    { user_id: u2, book_id: b("xUaHDwAAQBAJ").id, status: "lendo", is_favorite: false, rating: null, current_page: 200, started_at: "2026-04-10", finished_at: null },
    { user_id: u2, book_id: b("k6DwCwAAQBAJ").id, status: "lido", is_favorite: false, rating: 4.0, current_page: 416, started_at: "2026-01-15", finished_at: "2026-02-10" },
    { user_id: u2, book_id: b("Vn5xDwAAQBAJ").id, status: "quero_ler", is_favorite: false, rating: null, current_page: null, started_at: null, finished_at: null },

    // Usuário 3
    { user_id: u3, book_id: b("wrOQLV6xB-wC").id, status: "lido", is_favorite: true, rating: 5.0, current_page: 264, started_at: "2026-01-01", finished_at: "2026-01-12" },
    { user_id: u3, book_id: b("Pe4jEAAAQBAJ").id, status: "lido", is_favorite: false, rating: 3.5, current_page: 424, started_at: "2026-02-10", finished_at: "2026-03-01" },
    { user_id: u3, book_id: b("FKziDwAAQBAJ").id, status: "lendo", is_favorite: false, rating: null, current_page: 100, started_at: "2026-04-15", finished_at: null },
    { user_id: u3, book_id: b("NXQIEAAAQBAJ").id, status: "lido", is_favorite: false, rating: 4.5, current_page: 152, started_at: "2026-03-10", finished_at: "2026-03-18" },
  ];

  for (const ub of userBooksData) {
    const exists = await knex("user_books")
      .where({ user_id: ub.user_id, book_id: ub.book_id, deleted: false })
      .first();
    if (!exists) {
      await knex("user_books").insert({ ...ub, deleted: false });
    } else {
      await knex("user_books").where({ id: exists.id }).update({
        status: ub.status,
        is_favorite: ub.is_favorite,
        rating: ub.rating,
        current_page: ub.current_page,
        started_at: ub.started_at,
        finished_at: ub.finished_at,
        updated_at: knex.fn.now(),
      });
    }
  }

  // --- 6. Resenhas reais (todos os cenários) ---
  const now = knex.fn.now();

  const reviewsData = [
    // Cenário: resenha completa com nota, texto, datas, sem spoiler
    {
      user_id: u1, book_id: b("YHgwDwAAQBAJ").id,
      rating: 5.0,
      content: "Uma obra atemporal que nos faz refletir sobre o que realmente importa na vida. A simplicidade da narrativa esconde uma profundidade filosófica impressionante. Cada releitura revela uma camada nova de significado. O encontro com a raposa é um dos momentos mais bonitos da literatura.",
      has_spoiler: false,
      reading_start_date: "2026-01-10", reading_end_date: "2026-01-15",
      created_at: "2026-01-16 10:00:00",
    },
    // Cenário: resenha com spoiler
    {
      user_id: u1, book_id: b("wrOQLV6xB-wC").id,
      rating: 4.5,
      content: "A revelação de que o Professor Quirrell estava com Voldemort na parte de trás da cabeça foi um plot twist genial. A cena do espelho de Ojesed mostrando Harry com seus pais é devastadora. Rowling construiu um mundo mágico incrivelmente detalhado que prende desde a primeira página.",
      has_spoiler: true,
      reading_start_date: "2026-02-01", reading_end_date: "2026-02-20",
      created_at: "2026-02-21 14:30:00",
    },
    // Cenário: só nota, sem texto
    {
      user_id: u1, book_id: b("NXQIEAAAQBAJ").id,
      rating: 2.0,
      content: null,
      has_spoiler: false,
      reading_start_date: "2026-03-01", reading_end_date: null,
      created_at: "2026-03-15 08:00:00",
    },
    // Cenário: resenha completa de releitura
    {
      user_id: u1, book_id: b("Pe4jEAAAQBAJ").id,
      rating: 4.0,
      content: "Na releitura, percebi detalhes que passaram despercebidos da primeira vez. A ironia de Austen é afiada e atual mesmo depois de dois séculos. Elizabeth Bennet continua sendo uma das protagonistas mais cativantes da literatura. O desenvolvimento do Sr. Darcy é sutil e muito bem construído.",
      has_spoiler: false,
      reading_start_date: "2026-04-20", reading_end_date: null,
      created_at: "2026-04-25 19:00:00",
    },
    // Cenário: resenha de outro usuário, mesmo livro (perspectivas diferentes)
    {
      user_id: u2, book_id: b("YHgwDwAAQBAJ").id,
      rating: 5.0,
      content: "Li em uma tarde e não consegui parar de pensar nesse livro por dias. As ilustrações originais do autor complementam perfeitamente a narrativa. É daqueles livros que todo mundo deveria ler pelo menos uma vez na vida.",
      has_spoiler: false,
      reading_start_date: "2026-03-05", reading_end_date: "2026-03-06",
      created_at: "2026-03-07 11:00:00",
    },
    // Cenário: resenha longa, com spoiler
    {
      user_id: u2, book_id: b("k6DwCwAAQBAJ").id,
      rating: 4.0,
      content: "O final em que Winston finalmente ama o Grande Irmão é perturbador e genial ao mesmo tempo. Orwell criou um mundo tão plausível que dá arrepios. A neolíngua, a duplipensar, o Ministério do Amor — cada elemento é uma crítica cirúrgica ao totalitarismo. A relação com Julia é o único respiro humano num universo sufocante, e mesmo isso é destruído. Leitura essencial, embora pesada.",
      has_spoiler: true,
      reading_start_date: "2026-01-15", reading_end_date: "2026-02-10",
      created_at: "2026-02-11 16:45:00",
    },
    // Cenário: resenha completa de outro usuário
    {
      user_id: u3, book_id: b("wrOQLV6xB-wC").id,
      rating: 5.0,
      content: "Um clássico absoluto. A magia de Hogwarts encanta leitores de todas as idades. A amizade entre Harry, Ron e Hermione é o coração da história. Cada capítulo é uma aventura que te transporta completamente para aquele mundo.",
      has_spoiler: false,
      reading_start_date: "2026-01-01", reading_end_date: "2026-01-12",
      created_at: "2026-01-13 09:15:00",
    },
    // Cenário: resenha curta
    {
      user_id: u3, book_id: b("Pe4jEAAAQBAJ").id,
      rating: 3.5,
      content: "Bom romance, mas achei um pouco arrastado em algumas partes. A dinâmica entre Elizabeth e Darcy é ótima.",
      has_spoiler: false,
      reading_start_date: "2026-02-10", reading_end_date: "2026-03-01",
      created_at: "2026-03-02 20:00:00",
    },
    // Cenário: nota alta com resenha sem datas (livro lido há tempo)
    {
      user_id: u3, book_id: b("NXQIEAAAQBAJ").id,
      rating: 4.5,
      content: "Uma fábula política brilhante. A frase 'Todos os animais são iguais, mas alguns são mais iguais que outros' é uma das mais impactantes da literatura. Curto, direto e devastador.",
      has_spoiler: false,
      reading_start_date: "2026-03-10", reading_end_date: "2026-03-18",
      created_at: "2026-03-19 12:30:00",
    },
  ];

  for (const review of reviewsData) {
    await knex("reviews").insert({ ...review, deleted: false, updated_at: review.created_at });
  }

  // --- 7. Atualizações de leitura (reading_updates) - todos os cenários ---
  const updatesData = [
    // Cenário: progresso por página com comentário
    {
      user_id: u1, book_id: b("k6DwCwAAQBAJ").id,
      current_page: 50, percentage: 12.02,
      comment: "Acabei de começar. O mundo de Oceania é assustador desde as primeiras páginas.",
      reaction: null, has_spoiler: false,
      created_at: "2026-04-01 20:00:00",
    },
    // Cenário: progresso com reação (emoji)
    {
      user_id: u1, book_id: b("k6DwCwAAQBAJ").id,
      current_page: 100, percentage: 24.04,
      comment: "A parte da neolíngua é fascinante e aterrorizante.",
      reaction: "medo", has_spoiler: false,
      created_at: "2026-04-05 21:30:00",
    },
    // Cenário: progresso com spoiler
    {
      user_id: u1, book_id: b("k6DwCwAAQBAJ").id,
      current_page: 180, percentage: 43.27,
      comment: "Winston e Julia se encontraram no quarto acima da loja do Sr. Charrington. Que tensão!",
      reaction: "medo", has_spoiler: true,
      created_at: "2026-04-10 22:00:00",
    },
    // Cenário: só progresso, sem comentário
    {
      user_id: u1, book_id: b("Pe4jEAAAQBAJ").id,
      current_page: 60, percentage: 14.15,
      comment: null,
      reaction: null, has_spoiler: false,
      created_at: "2026-04-21 18:00:00",
    },
    // Cenário: progresso com reação positiva
    {
      user_id: u1, book_id: b("Pe4jEAAAQBAJ").id,
      current_page: 120, percentage: 28.30,
      comment: "O baile em Netherfield está incrível nessa releitura!",
      reaction: "amei", has_spoiler: false,
      created_at: "2026-04-28 19:30:00",
    },
    // Usuário 2
    // Cenário: leitura de O Hobbit - múltiplos updates mostrando progresso
    {
      user_id: u2, book_id: b("xUaHDwAAQBAJ").id,
      current_page: 50, percentage: 14.88,
      comment: "Gandalf apareceu na porta de Bilbo e a aventura começou!",
      reaction: "feliz", has_spoiler: false,
      created_at: "2026-04-10 20:00:00",
    },
    {
      user_id: u2, book_id: b("xUaHDwAAQBAJ").id,
      current_page: 120, percentage: 35.71,
      comment: "O encontro com Gollum e as charadas são brilhantes. 'Meu precioso...'",
      reaction: null, has_spoiler: true,
      created_at: "2026-04-15 21:00:00",
    },
    {
      user_id: u2, book_id: b("xUaHDwAAQBAJ").id,
      current_page: 200, percentage: 59.52,
      comment: "Os elfos da floresta são fascinantes. Tolkien descreve tudo com tanto detalhe!",
      reaction: "amei", has_spoiler: false,
      created_at: "2026-04-22 22:15:00",
    },
    // Cenário: atualização com percentual alto
    {
      user_id: u2, book_id: b("xUaHDwAAQBAJ").id,
      current_page: 280, percentage: 83.33,
      comment: "A batalha dos cinco exércitos está chegando. Não consigo parar de ler.",
      reaction: "fogo", has_spoiler: false,
      created_at: "2026-04-30 23:00:00",
    },
    // Usuário 3
    // Cenário: leitura de Dom Casmurro com reflexões
    {
      user_id: u3, book_id: b("FKziDwAAQBAJ").id,
      current_page: 40, percentage: 15.63,
      comment: "A narrativa de Bentinho prende mesmo. Machado é genial.",
      reaction: null, has_spoiler: false,
      created_at: "2026-04-16 17:00:00",
    },
    {
      user_id: u3, book_id: b("FKziDwAAQBAJ").id,
      current_page: 100, percentage: 39.06,
      comment: "Capitu realmente tem olhos de ressaca? Ou é a paranoia de Bentinho?",
      reaction: "triste", has_spoiler: false,
      created_at: "2026-04-25 20:30:00",
    },
    // Cenário: só reação, sem texto
    {
      user_id: u3, book_id: b("FKziDwAAQBAJ").id,
      current_page: 150, percentage: 58.59,
      comment: null,
      reaction: "raiva", has_spoiler: false,
      created_at: "2026-05-02 19:00:00",
    },
  ];

  for (const update of updatesData) {
    await knex("reading_updates").insert({ ...update, deleted: false });
  }

  // --- 8. Reações (likes/dislikes em resenhas) ---
  const allReviews = await knex("reviews").where("deleted", false).select("id", "user_id");

  for (const review of allReviews) {
    const otherUsers = [u1, u2, u3].filter((u) => u !== review.user_id);
    for (const uid of otherUsers) {
      const exists = await knex("review_reactions")
        .where({ user_id: uid, review_id: review.id })
        .first();
      if (!exists) {
        await knex("review_reactions").insert({
          user_id: uid,
          review_id: review.id,
          type: "like",
        });
      }
    }
  }

  // --- 9. Likes em atualizações de leitura ---
  const allUpdates = await knex("reading_updates").where("deleted", false).select("id", "user_id");

  for (const update of allUpdates) {
    const otherUsers = [u1, u2, u3].filter((u) => u !== update.user_id);
    if (otherUsers.length > 0) {
      const liker = otherUsers[0]!;
      const exists = await knex("reading_update_likes")
        .where({ user_id: liker, reading_update_id: update.id })
        .first();
      if (!exists) {
        await knex("reading_update_likes").insert({
          user_id: liker,
          reading_update_id: update.id,
        });
      }
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex("reading_update_likes").del();
  await knex("review_reactions").del();
  await knex("reading_updates").del();
  await knex("reviews").del();
}
